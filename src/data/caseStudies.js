// Summaries of the documented project scope. No invented metrics or attribution.
export const CASE_STUDIES = {
  'group-ride-sharing': {
    problem: 'A group ride needs a shared view of where everyone is, who is still connected, and how to coordinate along the way.',
    build: 'A React Native app connects GPS locations, private ride groups, invite codes, and persistent chat through Mapbox and Supabase.',
    decisions: [
      ['Realtime, with boundaries', 'Presence and stale-marker cleanup keep the shared map useful when a rider disconnects.'],
      ['Privacy in the data layer', 'Group-scoped row-level security and atomic Postgres operations support private group workflows.'],
    ],
    outcome: 'The repository brings live rider locations, group membership, and ride chat into one mobile workflow.',
    evidence: 'Explore the implementation and setup in the source repository.',
  },
  'robotic-arm-rl': {
    problem: 'Learning to move an arm toward a target and learning to physically grasp an object are different control problems.',
    build: 'The simulation combines PPO reaching with a KUKA arm and imitation-trained pick-and-place with a Franka Panda arm in PyBullet.',
    decisions: [
      ['Compare against baselines', 'Inverse-kinematics and random baselines provide context for evaluating the reaching policy.'],
      ['Keep the evidence reproducible', 'Task outcomes, seeds, checkpoints, and stress evaluations are recorded alongside the demonstrations.'],
    ],
    outcome: 'The project includes reaching and three-object manipulation demonstrations with evaluation reports. All work is simulation-only.',
    evidence: 'Review the simulation code, demonstrations, and evaluation reports in the repository.',
  },
  'risk-evaluation': {
    problem: 'Disaster incident records need validation and spatial context before they can support a useful view of seasonal risk.',
    build: 'A pipeline ingests Nepal’s BIPAD data, validates spatial records, trains seasonal models, and serves results through a Django API and React map.',
    decisions: [
      ['Make ingestion repeatable', 'Scheduled pipelines and spatial validation prepare records for downstream analysis.'],
      ['Evaluate across time', 'Temporal holdout evaluation and MLflow tracking support comparison of model experiments.'],
    ],
    outcome: 'The platform connects ingestion, model experiments, scheduled retraining, and a Leaflet dashboard with illustrative risk bands.',
    evidence: 'Explore the pipeline, API, and dashboard implementation in the repository.',
  },
};
