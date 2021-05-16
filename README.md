# Backup Control
Cloud Run service for making backups of users (firebase authentication) and firestore

(Datestamp is moment YYYY-MM-DD-HH-mm-ss so 2021-05-16-18-43-01)
User backups goes to /backups/users/{{DATESTAMP}}.json
Firestore backups go in /backups/firestore/{{DATESTAMP}}/

This service should be configured to require authentication (N when asked during deployment for public) without allUsers being configured with a role.
It should be configured with the service account it runs as to have the Cloud Run Invoker Role on itself

## Required service account permissions
##### Firebase Authentication Viewer
        This is used to be able to export firebase authentication users

##### Cloud Datastore Import Export Admin (Firestore is what is formerly Datastore)
        This is used to be able to trigger the firestore DB export

##### Storage Object Creator on the {{PROJECT_ID}}-backups GCS bucket
        This is used to upload the backups
##### Cloud Run Invoker on the BackupControl service
        This is used by Cloud Scheduler to trigger the service