const fs = require('fs');
const faker = require('faker');
// 加载一个名为 @google-cloud/logging 的模块。
// 这是 Google Cloud Platform 提供的一个 Node.js 客户端库，用于与 Google Cloud Logging 服务交互，进行日志记录操作。
const { Logging } = require("@google-cloud/logging");

// 定义 log 名
const logName = "pet-theory-logs-createTestData";

// 创建一个日志记录客户端, 建立与 GCP Logging 服务的连接
const logging = new Logging();
// 创建一个特定名称的日志记录器，以便后续将日志消息写入到 GCP Logging 服务中。
const log = logging.log(logName);

const resource = {
  // This example targets the "global" resource for simplicity
  type: "global",
};

// 生成随机邮件地址
function getRandomCustomerEmail(firstName, lastName) {
  const provider = faker.internet.domainName();
  const email = faker.internet.email(firstName, lastName, provider);
  return email.toLowerCase();
}

// 利用“faker”库生成虚假客户数据。
async function createTestData(recordCount) {
  // 文件名
  const fileName = `customers_${recordCount}.csv`;
  // 创建写入流
  // 'fs' 是 Node.js 核心模块，用于对文件系统进行操作。
  var f = fs.createWriteStream(fileName);
  // 写入 csv 的 header 信息
  f.write('id,name,email,phone\n')
  for (let i = 0; i < recordCount; i++) {
    // faker.datatype.number() 是 faker 库中的一个方法，用于生成一个随机数。
    const id = faker.datatype.number();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const name = `${firstName} ${lastName}`;
    const email = getRandomCustomerEmail(firstName, lastName);
    const phone = faker.phone.phoneNumber();
    f.write(`${id},${name},${email},${phone}\n`);
  }
  // A text log entry
  const success_message = `Success: createTestData - Created file ${fileName} containing ${recordCount} records.`;
  const entry = log.entry(
    { resource: resource },
    {
      name: `${fileName}`,
      recordCount: `${recordCount}`,
      message: `${success_message}`,
    }
  );
  log.write([entry]);
}

// process.argv 是一个包含命令行参数的数组。
// process.argv[0] 是 Node.js 的执行路径
// process.argv[1] 是当前执行的 JavaScript 文件的路径
// process.argv[2] 开始，便是传递给脚本的参数。
// 
// process 变量是 Node.js 中的一个全局对象，它提供了有关当前 Node.js 进程的信息以及控制 Node.js 进程的方法。
// Node.js 在启动时会创建 process 对象，并使其可供所有模块访问。
// process 对象中包含许多属性和方法，其中一些是用于与操作系统和环境交互的。
recordCount = parseInt(process.argv[2]);

if (process.argv.length != 3 || recordCount < 1 || isNaN(recordCount)) {
  console.error('Include the number of test data records to create. Example:');
  console.error('    node createTestData.js 100');

  // process.exit(1); 是 Node.js 中的一个语句，用于终止当前 Node.js 进程并返回指定的退出码
  // 一旦调用了 process.exit()，Node.js 将会立即终止当前进程的执行，不再执行后续的代码
  process.exit(1);
}

createTestData(recordCount);

