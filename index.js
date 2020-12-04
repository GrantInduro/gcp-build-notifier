const IncomingWebhook = require('@slack/client').IncomingWebhook;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK

console.log(process.env.SLACK_WEBHOOK);

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

// subscribe is the main function called by Cloud Functions.
module.exports.subscribe = (event, callback) => {
	const build = eventToBuild(event.data.data);

	// Skip if the current status is not in the status list.
	// Add additional statues to list if you'd like:
	// QUEUED, WORKING, SUCCESS, FAILURE,
	// INTERNAL_ERROR, TIMEOUT, CANCELLED
	const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
	if (status.indexOf(build.status) === -1) {
		return callback();
	}

	// Send message to Slack.
	const message = createSlackMessage(build);
	webhook.send(message, callback);
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
	console.log(data);
	return JSON.parse(new Buffer(data, 'base64'));
}

// createSlackMessage create a message from a build object.
const createSlackMessage = (build) => {
	let message = {
		text: `Build \`${build.id}\``,
		mrkdwn: true,
		attachments: [
			{
				title: 'Build logs - Your Custom Message Goes Here',
				title_link: build.logUrl,
				fields: [{
					title: 'Status',
					value: build.status
				}]
			}
		]
	};
	return message
}
