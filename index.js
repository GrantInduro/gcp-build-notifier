const IncomingWebhook = require('@slack/client').IncomingWebhook;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK;
const { parseISO } = require('date-fns')

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

// subscribe is the main function called by Cloud Functions.
module.exports.buildNotifier = async (req, res) => {
	try {
		const build = eventToBuild(req.body.message);
		// Skip if the current status is not in the status list.
		// Add additional statues to list if you'd like:
		// QUEUED, WORKING, SUCCESS, FAILURE,
		// INTERNAL_ERROR, TIMEOUT, CANCELLED
		const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
		if (status.indexOf(build.status) === -1) {
			return;
		}

		// Send message to Slack.
		const message = createSlackMessage(build);
		await webhook.send(message);
	} catch (e) {
		console.error(e);
	}
	res.status(200).send();
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
	const message = JSON.parse(Buffer.from(data.data, 'base64').toString());
	const { projectId, status, startTime, endTime, logUrl, source: {repoSource}, substitutions: {BRANCH_NAME} } = message;
	return {
		status,
		logUrl,
		id: projectId,
		startTime: parseISO(startTime),
		endTime: parseISO(endTime),
		source: {
			repo: repoSource.repoName,
			commit: repoSource.commitSha,
			branch: BRANCH_NAME
		}
	};
}

// createSlackMessage create a message from a build object.
const createSlackMessage = (build) => {
	let message = {
		text: `Build For Project ${build.id} Complete`,
		mrkdwn: true,
		attachments: [
			{
				title: 'Build Details',
				title_link: build.logUrl,
				fields: [
					{
						title: 'Status',
						value: build.status
					},
					{
						title: 'Repository',
						value: build.source.repo
					},
					{
						title: 'Branch',
						value: build.source.branch
					},
					{
						title: 'Commit',
						value: build.source.commit
					},
					{
						title: 'Start Time',
						value: build.startTime
					},
					{
						title: 'End Time',
						value: build.endTime
					}
				]
			}
		]
	};
	return message
}
