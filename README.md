# fetch-rc-milestones action

This action works for a very specific usage for projects that leverage GitHub milestones for Release Candidate PR tracking. Such that each milestone represents a group of PRs that have been merged into `main` that will be in the Release Candidate. This action fetches the project milestone that represents the Release Candidate that is targeted for the upcoming production deployment.

We determine the milestone by looking at it's **Due On** datetime as well as the string `release candidate` in the title. The Release Candidate found will either be the same day or in the future; never in the past.

**Assumptions**
1. You are generating Release Candidates in cadence.
2. Employing the [Trunk-Based Development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development) Branching methodology.
3. You group merged PRs (into `main`) in a milestone and a new Release Candidate will be cut from `main` targeted to `production`
4. The Release Candidate milestones contains the substring *release candidate*


## Development

### Prerequisite
You must have `ncc` installed in your global *node_modules* in order to build the project and not need to use local *node_modules* for the workflow. 

1. `npm i -g @vercel/ncc` (*you may have to run as sudo*)

### To Test Changes

1. Run `npm run build && npm run start`

### Committing

After making source changes and before committing be sure to run `npm run build` then commit. The **dist/index.js** file is used to run this Action in order to avoid needing the **node_modules** directory. It builds the modules all in the **index.js** file.

## Inputs

### `repoOwner`

**Required** The account owner of the repo

### `repo`

**Required** The name of the repo

### `githubApiToken`

**Required** GitHub API Token for accessing GitHub assets such as the tarball

### `dueOnDate`

**Optional** Find Release Candidate Milestone that has this due on date. If not provided then we find the upcoming RC Milestone. Expected format is YYYY-MM-DDTHH:mm:ss.sssZ ISO8601 format

## Outputs

### `milestone-title`

Milestone title that represents the Release Candidate that will be going out 

### `milestone-number`

The unique number representing the milestone.

### `milestone-id`

The unique id representing the milestone.


## Example usage
```
steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: Fetch milestones
        uses: ./.github/actions/fetch-rc-milestone
        with:
          repoOwner: <OWNER-ACCOUNT-NAME>
          repo: <REPO-NAME>
          githubApiToken: ${{ secrets.GITHUB_API_TOKEN }}

```