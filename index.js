const core = require('@actions/core')
const github = require('@actions/github')

/**
 * Get only the dates from the Date Object by setting
 * the time to all zeros
 * @param - Date object
 * @return - Date object
 * */
const getDateWithoutTime = date => {
	const dateWithoutTime = new Date(date.getTime())
	dateWithoutTime.setUTCHours(0,0,0,0)
	return dateWithoutTime
}

/**
 * Get all the milestones for a project based on the query options
 * https://octokit.github.io/rest.js/v18#issues-list-milestones
 * 
 * @param - OctoKit client
 * @param - Object of query parameters
 * @return - Async
 * */
const fetchMilestones = async (octoKit, queryOptions = {}) => {
	return octoKit.rest.issues.listMilestones(queryOptions)
}

/**
 * Get the milestone representing the Release Candidate that will be
 * getting deployed next or the Release Candidate milestone with the
 * same due date
 * 
 * @param - The substring to look for in the title of the milestone
 * @param - Array of milestone objects
 * @param - Optional Date string in ISO format
 * @return - Milestone Object 
 * */
const getNextRCMilestone = (keySubstring, milestones, dueDate = null) => {
	const targetDate = dueDate ? getDateWithoutTime(new Date(dueDate)) : getDateWithoutTime(new Date())
	const filteredMilestones = milestones.filter((m) => {
		const dueOn = getDateWithoutTime(new Date(m.due_on))
		let isDateValid
		if (dueDate) {
			isDateValid = (dueOn.getTime() === targetDate.getTime()) // look for milestone with same due date
		} else {
			isDateValid = (dueOn >= targetDate) // for upcoming milestone
		}
		return isDateValid && m.title.toLowerCase().includes(keySubstring)
	})
	return filteredMilestones.length > 0 ? filteredMilestones[0] : null
}

const run = async () => {
	try {

		// Get Input
		const token = core.getInput('githubApiToken')
		const repo = core.getInput('repo')
		const owner = core.getInput('repoOwner')
		const dueDate = core.getInput('dueOnDate') ?? null

		// Setup GH client
		const octoKit = new github.getOctokit(token)

		// Setup Params
		const state = 'open'
		const sort = 'due_on'
		const direction = 'asc'

		// 1. Fetch open milestones
		const { data: allOpenMilestones } = await fetchMilestones(octoKit, {owner, repo, state, sort, direction})
		console.log(`Successfully fetched ${allOpenMilestones.length} milestones`)
		console.log('Filtering...')

		// 2. Get the next Release Candidate Milestone that will be deployed next or that will be deployed on dueDate
		const milestone = getNextRCMilestone('release candidate', allOpenMilestones, dueDate)
		if(milestone) {
			console.log(`Successfully found milestone: ${milestone.title}`)
		} else {
			console.log('Did not find any Release Candidate milestones')
		}

		// 3. Set Outputs
		core.setOutput('milestone-title', milestone ? milestone.title : null)
		core.setOutput('milestone-number', milestone ? milestone.number : null)
		core.setOutput('milestone-id', milestone ? milestone.id : null)
	} catch (error) {
		core.debug(error)
		console.log(error)
		core.setFailed(error.message)
	}
}

run()