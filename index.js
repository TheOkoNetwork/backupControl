const express = require('express')

const app = express()
app.set('port', process.env.PORT || 3000)
const admin = require('firebase-admin')
admin.initializeApp()

const firebaseTools = require('firebase-tools')

const fs = require('fs')
const moment = require('moment')

const bucketName = process.env.BACKUP_BUCKET
const bucket = admin.storage().bucket(bucketName)
const { auth } = require('google-auth-library')

const backupUsers = async function () {
  const projectId = await auth.getProjectId()
  console.log(projectId)

  await firebaseTools.auth.export('./users.json', {
    project: projectId
  })
  console.log('Exported users to users.json')
  const usersJson = await JSON.parse(fs.readFileSync('users.json', 'utf8'))

  const dateStamp = moment().format('YYYY-MM-DD-HH-mm-ss')
  const fileUploadPath = `backups/users/${dateStamp}.json`
  await bucket.upload('./users.json', { destination: fileUploadPath })
  console.log(`Uploaded users.json to: ${fileUploadPath}`)
  console.log(`Uploaded ${fileUploadPath}`)

  return usersJson.users.length
}

const backupFirestore = async function () {
  const projectId = await auth.getProjectId()
  console.log(projectId)

  const adminClient = await auth.getClient()

  const dateStamp = moment().format('YYYY-MM-DD-HH-mm-ss')
  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`
  const result = await adminClient.request({
    url,
    method: 'post',
    data: {
      outputUriPrefix: `gs://${bucketName}/backups/firestore/${dateStamp}`
    }
  })
  console.log(result)
  return result
}

app.get('/backupUsers', async function (req, res) {
  const backupResult = await backupUsers()
  res.status(200).send(`Backed up: ${backupResult} users`)
})
app.get('/backupFirestore', async function (req, res) {
  const backupResult = await backupFirestore()
  const backupMetadata = backupResult.data.metadata.outputUriPrefix
  const backupResultString = `${backupMetadata.operationState}-${backupMetadata.startTime}-${backupMetadata.outputUriPrefix}`
  res.status(200).send(`Got backup result: ${backupResultString}`)
})

const server = app.listen(app.get('port'), function () {
  console.log('BackupControl listening on port %d', server.address().port)
})
