# Slack Build Notifier
The slack build notifier will send messages to a slack channel with GCP build status updates
To get started I used this tutorial, https://mehmandarov.com/slack-notifications-for-cloud-build/

## Setup Steps
1. Create GCP project and enable billing
2. Enable GCP API's
    * Functions
    * Pub/Sub
    * Build
3. Create Slack Channel, Slack App, and Webhook
4. Create staging bucket 
    ```shell script
   gsutil mb -p [PROJECT_ID] gs://[STAGING_BUCKET_NAME]
   ```
5. Deploy cloud function.
    ```shell script
    gcloud functions deploy subscribe --stage-bucket [STAGING_BUCKET_NAME] \
        --trigger-topic cloud-builds 
    ```


## TODO
* [Add authentication to function](https://cloud.google.com/pubsub/docs/push#authentication_and_authorization)
