// csv-parse 是 Node.js 中的一个流行的模块，用于解析 CSV 格式的数据。
const csv = require('csv-parse');
const fs = require('fs');
const { Firestore } = require("@google-cloud/firestore");

// 简单验证参数中是否传入 csv 文件
if (process.argv.length < 3) {
  console.error('Please include a path to a csv file');
  process.exit(1);
}

async function writeToFirestore(records) {
  // 初始化 Firestore
  const db = new Firestore({
    //        projectId: projectId 
  });
  // 创建一个写入批处理，用于将多个写入作为单个原子操作执行。
  const batch = db.batch()

  records.forEach((record) => {
    console.log(`Write: ${record}`)
    const docRef = db.collection("customers").doc(record.email);
    batch.create(docRef, record)
  })

  batch.commit()
    .then(() => {
      console.log('Batch executed')
    })
    .catch(err => {
      console.log(`Batch error: ${err}`)
    })
  return
}

async function importCsv(csvFilename) {
  // 创建了一个 CSV 解析器，该解析器用于将 CSV 数据转换为 JavaScript 对象数组。
  // columns: true 表示将第一行作为 CSV 数据的列名（字段名）
  // delimiter: ',' 表示 CSV 数据中使用逗号作为字段分隔符。
  // 第二个参数是一个回调函数，用于处理解析完成后的数据。
  const parser = csv.parse({ columns: true, delimiter: ',' }, async function (err, records) {
    if (err) {
      console.error('Error parsing CSV:', err);
      return;
    }
    try {
      console.log(`Call write to Firestore`);
      await writeToFirestore(records);
      console.log(`Wrote ${records.length} records`);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });

  // 创建一个可读流来读取指定路径下的 CSV 文件，并将读取到的数据流传输给一个 CSV 解析器，然后使用 await 关键字等待解析器完成对 CSV 数据的解析。
  await fs.createReadStream(csvFilename).pipe(parser);
}

importCsv(process.argv[2]).catch(e => console.error(e));
