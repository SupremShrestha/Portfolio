export const CONVERSATION_TOPICS = [
  { id: 'project', label: 'Build something', short: 'A project', title: 'Tell me what you have in mind.', description: 'A rough idea is a good place to start.', prompts: ['What would you like to build?', 'Who is it for?', 'Where are you with the idea?'], starter: 'Hi Suprem, I have a project in mind.\n\nThe idea is…\nIt would help…\nSo far, I have…' },
  { id: 'ai', label: 'Talk AI & data', short: 'AI & data', title: 'Let’s compare notes.', description: 'A question, an experiment, or a possibility.', prompts: ['What are you exploring?', 'What have you tried?', 'What would you like to figure out?'], starter: 'Hi Suprem, I’m exploring something in AI or data.\n\nI’m curious about…\nI’ve been trying…\nI’d love to discuss…' },
  { id: 'hello', label: 'Just say hello', short: 'Say hello', title: 'No perfect pitch required.', description: 'Sometimes a shared curiosity is enough.', prompts: ['What caught your attention?', 'What do we have in common?', 'What would you like to share?'], starter: 'Hi Suprem,\n\nI came across your portfolio and wanted to say hello. I’m interested in…' },
];

export function resolveConversationTopic(id) {
  return CONVERSATION_TOPICS.find(topic => topic.id === id) || CONVERSATION_TOPICS[0];
}

export function messageForTopic(message, id) {
  const original = typeof message === 'string' ? message : '';
  const isStarter = CONVERSATION_TOPICS.some(topic => topic.starter === original.trim());
  return !original.trim() || isStarter ? resolveConversationTopic(id).starter : original;
}
