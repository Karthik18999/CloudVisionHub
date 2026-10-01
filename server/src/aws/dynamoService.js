const {
  PutCommand,
  ScanCommand,
  DeleteItemCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');
const { dynamoDocClient, isMockMode, tableName } = require('./clients');
const mockAwsEngine = require('./mockAwsEngine');
const crypto = require('crypto');

async function saveVisionRecord(record) {
  const id = `rec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const fullItem = {
    id,
    ...record,
    createdAt: new Date().toISOString()
  };

  if (isMockMode) {
    return mockAwsEngine.putDynamoItem(fullItem);
  }

  const command = new PutCommand({
    TableName: tableName,
    Item: fullItem
  });

  await dynamoDocClient.send(command);
  return fullItem;
}

async function scanVisionRecords() {
  if (isMockMode) {
    return mockAwsEngine.scanDynamoTable();
  }

  const command = new ScanCommand({
    TableName: tableName
  });

  const result = await dynamoDocClient.send(command);
  return result.Items || [];
}

async function deleteVisionRecord(id) {
  if (isMockMode) {
    return mockAwsEngine.deleteDynamoItem(id);
  }

  const command = new DeleteItemCommand({
    TableName: tableName,
    Key: { id }
  });

  await dynamoDocClient.send(command);
  return true;
}

module.exports = {
  saveVisionRecord,
  scanVisionRecords,
  deleteVisionRecord
};
