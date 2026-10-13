export const phase27RegisterOntologies = {
  aave: {
    id: 'aave',
    label: 'AAVE Register Ontology',
    featureSets: {
      aspectMarkers: ['been', 'finna', 'done', 'steady'],
      negationPatterns: ["don't", 'dont', 'not there', 'ain’t', "ain't"],
      relationalAddress: ['girl', 'sis', 'bruh', 'yall', "y'all"],
      emphasisPatterns: ['be so fr', 'deadass', 'the way', 'not me'],
      lexicalItems: ['ion', 'ima', 'finna', 'tryna', 'gotta']
    },
    preserveRules: ['preserve-aspect', 'preserve-negation-meaning', 'preserve-relational-address', 'do-not-infer-identity'],
    transformWarnings: ['register-shift-warning-required', 'identity-inference-forbidden']
  },
  chatspeak: {
    id: 'chatspeak',
    label: 'Chatspeak Register Ontology',
    featureSets: {
      abbreviations: ['idk', 'bc', 'rn', 'fr', 'ngl', 'lol', 'lmao', 'pls'],
      elongations: ['sooo', 'nooo', 'plsss'],
      punctuationBursts: ['??', '!!', '?!'],
      discourseMarkers: ['like', 'lowkey', 'kinda', 'literally'],
      hedges: ['maybe', 'idk', 'kinda', 'lowkey'],
      affectTokens: ['lol', 'lmao', '😭', '💀']
    },
    preserveRules: ['preserve-hedges', 'preserve-affect-or-describe', 'do-not-inflate-certainty'],
    transformWarnings: ['chat-register-shift-warning-required']
  }
};

export default phase27RegisterOntologies;
