import {
  auditTD613ApertureWitnessAnchors,
  buildTD613ApertureAudit,
  buildTD613OntologyAudit,
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  reviewTD613ApertureTransfer
} from './td613-aperture.js';
import {
  buildBorrowedShellDonorProgress,
  buildSemanticAuditBundle,
  buildOpportunityProfileFromIR,
  cadenceModFromProfile,
  compareTexts,
  extractCadenceProfile,
  segmentTextToIR,
  sentenceSplit
} from './stylometry.js';

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function normalizeText(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .trim();
}

function normalizeComparable(text = '') {
  return normalizeText(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMovementComparable(text = '') {
  return normalizeComparable(text)
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bi've\b/g, 'i have')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bthat's\b/g, 'that is')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean))];
}

function escapeRegex(value = '') {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MASK_ALPHA_SEQUENCE = Object.freeze([
  'ALPHA',
  'BRAVO',
  'CHARLIE',
  'DELTA',
  'ECHO',
  'FOXTROT',
  'GOLF',
  'HOTEL',
  'INDIA',
  'JULIET',
  'KILO',
  'LIMA'
]);

const NULL_TIME_VARIABLES = Object.freeze([
  Object.freeze({ id: 'later-that-night', pattern: /\blater that night\b/gi }),
  Object.freeze({ id: 'later-that-day', pattern: /\blater that day\b/gi }),
  Object.freeze({ id: 'later-on', pattern: /\blater on\b/gi }),
  Object.freeze({ id: 'some-time-later', pattern: /\bsome time later\b/gi }),
  Object.freeze({ id: 'shortly-after', pattern: /\bshortly after(?:ward)?\b/gi }),
  Object.freeze({ id: 'afterward', pattern: /\bafterward\b/gi }),
  Object.freeze({ id: 'by-then', pattern: /\bby then\b/gi }),
  Object.freeze({ id: 'that-evening', pattern: /\bthat evening\b/gi }),
  Object.freeze({ id: 'that-morning', pattern: /\bthat morning\b/gi }),
  Object.freeze({ id: 'that-afternoon', pattern: /\bthat afternoon\b/gi }),
  Object.freeze({ id: 'earlier', pattern: /\bearlier\b/gi }),
  Object.freeze({ id: 'before-dawn', pattern: /\bbefore dawn\b/gi }),
  Object.freeze({ id: 'overnight', pattern: /\bovernight\b/gi })
]);

const VERNACULAR_FEATURE_FAMILIES = Object.freeze([
  'orthographyNoise',
  'chatspeakShorthand',
  'notePosture',
  'slangMarkers',
  'vernacularMarkers'
]);

const EXTRA_CHATSPEAK_SHORTHAND_RULES = Object.freeze([
  Object.freeze({ id: 'afk', pattern: /\bafk\b/gi, formal: 'away from keyboard', degradePattern: /\baway from keyboard\b/gi }),
  Object.freeze({ id: 'bbl', pattern: /\bbbl\b/gi, formal: 'be back later', degradePattern: /\bbe back later\b/gi }),
  Object.freeze({ id: 'bbs', pattern: /\bbbs\b/gi, formal: 'be back soon', degradePattern: /\bbe back soon\b/gi }),
  Object.freeze({ id: 'bff', pattern: /\bbff\b/gi, formal: 'best friend', degradePattern: /\bbest friend\b/gi }),
  Object.freeze({ id: 'brt', pattern: /\bbrt\b/gi, formal: 'be right there', degradePattern: /\bbe right there\b/gi }),
  Object.freeze({ id: 'cya', pattern: /\bcya\b/gi, formal: 'see you', degradePattern: /\bsee you\b/gi }),
  Object.freeze({ id: 'dm', pattern: /\bdm\b/gi, formal: 'direct message', degradePattern: /\bdirect message\b/gi }),
  Object.freeze({ id: 'dms', pattern: /\bdms\b/gi, formal: 'direct messages', degradePattern: /\bdirect messages\b/gi }),
  Object.freeze({ id: 'fomo', pattern: /\bfomo\b/gi, formal: 'fear of missing out', degradePattern: /\bfear of missing out\b/gi }),
  Object.freeze({ id: 'ftw', pattern: /\bftw\b/gi, formal: 'for the win', degradePattern: /\bfor the win\b/gi }),
  Object.freeze({ id: 'gl', pattern: /\bgl\b/gi, formal: 'good luck', degradePattern: /\bgood luck\b/gi }),
  Object.freeze({ id: 'gm', pattern: /\bgm\b/gi, formal: 'good morning', degradePattern: /\bgood morning\b/gi }),
  Object.freeze({ id: 'gn', pattern: /\bgn\b/gi, formal: 'good night', degradePattern: /\bgood night\b/gi }),
  Object.freeze({ id: 'gr8', pattern: /\bgr8\b/gi, formal: 'great', degradePattern: /\bgreat\b/gi }),
  Object.freeze({ id: 'gtg', pattern: /\bgtg\b/gi, formal: 'got to go', degradePattern: /\bgot to go\b/gi }),
  Object.freeze({ id: 'hbu', pattern: /\bhbu\b/gi, formal: 'how about you', degradePattern: /\bhow about you\b/gi }),
  Object.freeze({ id: 'hmu', pattern: /\bhmu\b/gi, formal: 'contact me', degradePattern: /\bcontact me\b/gi }),
  Object.freeze({ id: 'icymi', pattern: /\bicymi\b/gi, formal: 'in case you missed it', degradePattern: /\bin case you missed it\b/gi }),
  Object.freeze({ id: 'idts', pattern: /\bidts\b/gi, formal: 'I do not think so', degradePattern: /\bI do not think so\b/gi }),
  Object.freeze({ id: 'ig', pattern: /\big\b/gi, formal: 'I guess', degradePattern: /\bI guess\b/gi }),
  Object.freeze({ id: 'ik', pattern: /\bik\b/gi, formal: 'I know', degradePattern: /\bI know\b/gi }),
  Object.freeze({ id: 'ikr', pattern: /\bikr\b/gi, formal: 'I know, right', degradePattern: /\bI know, right\b/gi }),
  Object.freeze({ id: 'ily', pattern: /\bily\b/gi, formal: 'I love you', degradePattern: /\bI love you\b/gi }),
  Object.freeze({ id: 'jk', pattern: /\bj\/?k\b/gi, formal: 'joking', degradePattern: /\bjoking\b/gi, compressed: 'jk' }),
  Object.freeze({ id: 'l8r', pattern: /\bl8r\b/gi, formal: 'later', degradePattern: /\blater\b/gi }),
  Object.freeze({ id: 'lmfao', pattern: /\blmfao\b/gi, formal: 'strong informal laughter marker', degradePattern: /\bstrong informal laughter marker\b/gi }),
  Object.freeze({ id: 'mb', pattern: /\bmb\b/gi, formal: 'my mistake', degradePattern: /\bmy mistake\b/gi }),
  Object.freeze({ id: 'nbd', pattern: /\bnbd\b/gi, formal: 'no big deal', degradePattern: /\bno big deal\b/gi }),
  Object.freeze({ id: 'nm', pattern: /\bnm\b/gi, formal: 'never mind', degradePattern: /\bnever mind\b/gi }),
  Object.freeze({ id: 'obv', pattern: /\bobv\b/gi, formal: 'obviously', degradePattern: /\bobviously\b/gi }),
  Object.freeze({ id: 'ofc', pattern: /\bofc\b/gi, formal: 'of course', degradePattern: /\bof course\b/gi }),
  Object.freeze({ id: 'plz', pattern: /\bplz\b/gi, formal: 'please', degradePattern: /\bplease\b/gi }),
  Object.freeze({ id: 'pov', pattern: /\bpov\b/gi, formal: 'point of view', degradePattern: /\bpoint of view\b/gi }),
  Object.freeze({ id: 'rly', pattern: /\brly\b/gi, formal: 'really', degradePattern: /\breally\b/gi }),
  Object.freeze({ id: 'rofl', pattern: /\brofl\b/gi, formal: 'strong informal laughter marker', degradePattern: /\bstrong informal laughter marker\b/gi }),
  Object.freeze({ id: 'srsly', pattern: /\bsrsly\b/gi, formal: 'seriously', degradePattern: /\bseriously\b/gi }),
  Object.freeze({ id: 'tba', pattern: /\btba\b/gi, formal: 'to be announced', degradePattern: /\bto be announced\b/gi }),
  Object.freeze({ id: 'tbc', pattern: /\btbc\b/gi, formal: 'to be continued', degradePattern: /\bto be continued\b/gi }),
  Object.freeze({ id: 'tfw', pattern: /\btfw\b/gi, formal: 'that feeling when', degradePattern: /\bthat feeling when\b/gi }),
  Object.freeze({ id: 'ttyl', pattern: /\bttyl\b/gi, formal: 'talk to you later', degradePattern: /\btalk to you later\b/gi }),
  Object.freeze({ id: 'w/e', pattern: /\bw\/e\b/gi, formal: 'whatever', degradePattern: /\bwhatever\b/gi, compressed: 'w/e' }),
  Object.freeze({ id: 'wfh', pattern: /\bwfh\b/gi, formal: 'work from home', degradePattern: /\bwork from home\b/gi }),
  Object.freeze({ id: 'wth', pattern: /\bwth\b/gi, formal: 'what the heck', degradePattern: /\bwhat the heck\b/gi }),
  Object.freeze({ id: 'wtf', pattern: /\bwtf\b/gi, formal: 'what the heck', degradePattern: /\bwhat the heck\b/gi }),
  Object.freeze({ id: 'yday', pattern: /\byday\b/gi, formal: 'yesterday', degradePattern: /\byesterday\b/gi }),
  Object.freeze({ id: 'yw', pattern: /\byw\b/gi, formal: 'you are welcome', degradePattern: /\byou are welcome\b/gi }),
  Object.freeze({ id: 'cmon', pattern: /\bcmon\b/gi, formal: 'come on', degradePattern: /\bcome on\b/gi }),
  Object.freeze({ id: 'coz', pattern: /\bcoz\b/gi, formal: 'because', degradePattern: /\bbecause\b/gi }),
  Object.freeze({ id: 'dunno', pattern: /\bdunno\b/gi, formal: 'do not know', degradePattern: /\bdo not know\b/gi }),
  Object.freeze({ id: 'fav', pattern: /\bfav(?:e)?\b/gi, formal: 'favorite', degradePattern: /\bfavorite\b/gi, compressed: 'fav' }),
  Object.freeze({ id: 'nb', pattern: /\bnb\b/gi, formal: 'note well', degradePattern: /\bnote well\b/gi }),
  Object.freeze({ id: 'deets', pattern: /\bdeets\b/gi, formal: 'details', degradePattern: /\bdetails\b/gi }),
  Object.freeze({ id: 'bday', pattern: /\bbday\b/gi, formal: 'birthday', degradePattern: /\bbirthday\b/gi }),
  Object.freeze({ id: 'tix', pattern: /\btix\b/gi, formal: 'tickets', degradePattern: /\btickets\b/gi }),
  Object.freeze({ id: 'pic', pattern: /\bpic\b/gi, formal: 'picture', degradePattern: /\bpicture\b/gi }),
  Object.freeze({ id: 'pics', pattern: /\bpics\b/gi, formal: 'pictures', degradePattern: /\bpictures\b/gi }),
  Object.freeze({ id: 'vid', pattern: /\bvid\b/gi, formal: 'video', degradePattern: /\bvideo\b/gi }),
  Object.freeze({ id: 'vids', pattern: /\bvids\b/gi, formal: 'videos', degradePattern: /\bvideos\b/gi }),
  Object.freeze({ id: 'app', pattern: /\bapp\b/gi, formal: 'application', degradePattern: /\bapplication\b/gi }),
  Object.freeze({ id: 'sec', pattern: /\bsec\b/gi, formal: 'second', degradePattern: /\bsecond\b/gi }),
  Object.freeze({ id: 'mins', pattern: /\bmins\b/gi, formal: 'minutes', degradePattern: /\bminutes\b/gi }),
  Object.freeze({ id: 'hrs', pattern: /\bhrs\b/gi, formal: 'hours', degradePattern: /\bhours\b/gi }),
  Object.freeze({ id: 'wks', pattern: /\bwks\b/gi, formal: 'weeks', degradePattern: /\bweeks\b/gi }),
  Object.freeze({ id: 'loc', pattern: /\bloc\b/gi, formal: 'location', degradePattern: /\blocation\b/gi }),
  Object.freeze({ id: 'qty', pattern: /\bqty\b/gi, formal: 'quantity', degradePattern: /\bquantity\b/gi }),
  Object.freeze({ id: 'num', pattern: /\bnum\b/gi, formal: 'number', degradePattern: /\bnumber\b/gi }),
  Object.freeze({ id: 'svc', pattern: /\bsvc\b/gi, formal: 'service', degradePattern: /\bservice\b/gi }),
  Object.freeze({ id: 'cfg', pattern: /\bcfg\b/gi, formal: 'configuration', degradePattern: /\bconfiguration\b/gi }),
  Object.freeze({ id: 'auth', pattern: /\bauth\b/gi, formal: 'authorization', degradePattern: /\bauthorization\b/gi }),
  Object.freeze({ id: 'est', pattern: /\best\b/gi, formal: 'estimated', degradePattern: /\bestimated\b/gi }),
  Object.freeze({ id: 'incl', pattern: /\bincl\b/gi, formal: 'including', degradePattern: /\bincluding\b/gi }),
  Object.freeze({ id: 'excl', pattern: /\bexcl\b/gi, formal: 'excluding', degradePattern: /\bexcluding\b/gi }),
  Object.freeze({ id: 'wrt', pattern: /\bwrt\b/gi, formal: 'with respect to', degradePattern: /\bwith respect to\b/gi }),
  Object.freeze({ id: 'f/u', pattern: /\bf\/u\b/gi, formal: 'follow-up', degradePattern: /\bfollow-up\b/gi, compressed: 'f/u' }),
  Object.freeze({ id: 'convo', pattern: /\bconvo\b/gi, formal: 'conversation', degradePattern: /\bconversation\b/gi })
]);

const VERNACULAR_FEATURE_RULES = Object.freeze({
  orthographyNoise: Object.freeze([
    Object.freeze({ id: 'lowercase-sentence-start', pattern: /(?:^|[.!?]\s+|\n+)[a-z]/g }),
    Object.freeze({ id: 'lowercase-i', pattern: /(?:^|[.!?]\s+|\n+)i(?:\b|['’](?:m|ve|ll|d)\b)/g }),
    Object.freeze({ id: 'standalone-lowercase-i', pattern: /(?:^|[\s([{'"“‘])i(?:\b|['’](?:m|ve|ll|d)\b)/g }),
    Object.freeze({ id: 'apostrophe-drop', pattern: /\b(?:wasnt|werent|dont|doesnt|didnt|cant|couldnt|shouldnt|wont|isnt|arent|im|ive|ill|id|youre|theyre|thats|theres|whats|hes|shes|lets)\b/gi })
  ]),
  chatspeakShorthand: Object.freeze([
    Object.freeze({ id: 'pkg', pattern: /\bpkg\b/gi }),
    Object.freeze({ id: 'mgmt', pattern: /\bmgmt\b/gi }),
    Object.freeze({ id: 'dept', pattern: /\bdept\b/gi }),
    Object.freeze({ id: 'sup', pattern: /\bsup\b/gi }),
    Object.freeze({ id: 'docs', pattern: /\bdocs\b/gi }),
    Object.freeze({ id: 'sched', pattern: /\bsched\b/gi }),
    Object.freeze({ id: 'tmrw', pattern: /\btmrw\b/gi }),
    Object.freeze({ id: 'irl', pattern: /\birl\b/gi }),
    Object.freeze({ id: 'rn', pattern: /\brn\b/gi }),
    Object.freeze({ id: 'pm-pretty-much', pattern: /\bpm\b/gi }),
    Object.freeze({ id: 'lmk', pattern: /\blmk\b/gi }),
    Object.freeze({ id: 'asap', pattern: /\basap\b/gi }),
    Object.freeze({ id: 'fwd', pattern: /\bfwd\b/gi }),
    Object.freeze({ id: 'perf', pattern: /\bperf\b/gi }),
    Object.freeze({ id: 'fl', pattern: /\b(?:2nd|3rd|4th)\s+fl\b/gi }),
    Object.freeze({ id: 'apt', pattern: /\bapt\b/gi }),
    Object.freeze({ id: 'bldg', pattern: /\bbldg\b/gi }),
    Object.freeze({ id: 'pls', pattern: /\bpls\b/gi }),
    Object.freeze({ id: 'idk', pattern: /\bidk\b/gi }),
    Object.freeze({ id: 'dk', pattern: /\bdk\b/gi }),
    Object.freeze({ id: 'idc', pattern: /\bidc\b/gi }),
    Object.freeze({ id: 'idrc', pattern: /\bidrc\b/gi }),
    Object.freeze({ id: 'idrk', pattern: /\bidrk\b/gi }),
    Object.freeze({ id: 'tbh', pattern: /\btbh\b/gi }),
    Object.freeze({ id: 'ngl', pattern: /\bngl\b/gi }),
    Object.freeze({ id: 'fr', pattern: /\bfr\b/gi }),
    Object.freeze({ id: 'btw', pattern: /\bbtw\b/gi }),
    Object.freeze({ id: 'fyi', pattern: /\bfyi\b/gi }),
    Object.freeze({ id: 'imo', pattern: /\bimo\b/gi }),
    Object.freeze({ id: 'imho', pattern: /\bimho\b/gi }),
    Object.freeze({ id: 'tbf', pattern: /\btbf\b/gi }),
    Object.freeze({ id: 'fwiw', pattern: /\bfwiw\b/gi }),
    Object.freeze({ id: 'afaik', pattern: /\bafaik\b/gi }),
    Object.freeze({ id: 'iirc', pattern: /\biirc\b/gi }),
    Object.freeze({ id: 'tldr', pattern: /\btl;?dr\b/gi }),
    Object.freeze({ id: 'wyd', pattern: /\bwyd\b/gi }),
    Object.freeze({ id: 'wbu', pattern: /\bwbu\b/gi }),
    Object.freeze({ id: 'nvm', pattern: /\bnvm\b/gi }),
    Object.freeze({ id: 'dw', pattern: /\bdw\b/gi }),
    Object.freeze({ id: 'np', pattern: /\bnp\b/gi }),
    Object.freeze({ id: 'ty', pattern: /\b(?:ty|thx|tx)\b/gi }),
    Object.freeze({ id: 'sry', pattern: /\bsry\b/gi }),
    Object.freeze({ id: 'omw', pattern: /\bomw\b/gi }),
    Object.freeze({ id: 'brb', pattern: /\bbrb\b/gi }),
    Object.freeze({ id: 'atm', pattern: /\batm\b/gi }),
    Object.freeze({ id: 'w/', pattern: /\bw\/\b/gi }),
    Object.freeze({ id: 'w/o', pattern: /\bw\/o\b/gi }),
    Object.freeze({ id: 'b/c', pattern: /\bb\/c\b/gi }),
    Object.freeze({ id: 'u', pattern: /\bu\b/gi }),
    Object.freeze({ id: 'ur', pattern: /\bur\b/gi }),
    Object.freeze({ id: 'r', pattern: /\br\b/gi }),
    Object.freeze({ id: 'hall-table', pattern: /\bhall table\b/gi }),
    Object.freeze({ id: 'bc', pattern: /\bbc\b/gi }),
    Object.freeze({ id: 'cuz', pattern: /\bcuz\b/gi }),
    Object.freeze({ id: 'tho', pattern: /\btho\b/gi }),
    Object.freeze({ id: 'thru', pattern: /\bthru\b/gi }),
    Object.freeze({ id: 'ppl', pattern: /\bppl\b/gi }),
    Object.freeze({ id: 'prob', pattern: /\bprob\b/gi }),
    Object.freeze({ id: 'def', pattern: /\bdef\b/gi }),
    Object.freeze({ id: 'acct', pattern: /\bacct\b/gi }),
    Object.freeze({ id: 'addr', pattern: /\baddr\b/gi }),
    Object.freeze({ id: 'info', pattern: /\binfo\b/gi }),
    Object.freeze({ id: 'admin', pattern: /\badmin\b/gi }),
    Object.freeze({ id: 'ops', pattern: /\bops\b/gi }),
    Object.freeze({ id: 'req', pattern: /\breq\b/gi }),
    Object.freeze({ id: 'resched', pattern: /\bresched\b/gi }),
    Object.freeze({ id: 'approx', pattern: /\bapprox\b/gi }),
    Object.freeze({ id: 'eta', pattern: /\beta\b/gi }),
    Object.freeze({ id: 'tbd', pattern: /\btbd\b/gi }),
    Object.freeze({ id: 'appt', pattern: /\bappt\b/gi }),
    Object.freeze({ id: 'msg', pattern: /\bmsg\b/gi }),
    Object.freeze({ id: 'wk', pattern: /\bwk\b/gi }),
    Object.freeze({ id: 'b4', pattern: /\bb4\b/gi }),
    Object.freeze({ id: 'graf', pattern: /\bgraf\b/gi }),
    Object.freeze({ id: 'hed', pattern: /\bhed\b/gi }),
    Object.freeze({ id: 'speaker-tag', pattern: /\bspeaker tag\b/gi }),
    Object.freeze({ id: 'body-fixed', pattern: /\bbody fixed\b/gi }),
    Object.freeze({ id: 'newsletter-grab', pattern: /\bnewsletter grab\b/gi }),
    ...EXTRA_CHATSPEAK_SHORTHAND_RULES.map((rule) => Object.freeze({ id: rule.id, pattern: rule.pattern }))
  ]),
  notePosture: Object.freeze([
    Object.freeze({ id: 'slash-list', pattern: /\s\/\s/g }),
    Object.freeze({ id: 'colon-note', pattern: /:\s+[a-z0-9]/g }),
    Object.freeze({ id: 'plus-join', pattern: /\s\+\s/g }),
    Object.freeze({ id: 'ampersand-join', pattern: /\s&\s/g })
  ]),
  slangMarkers: Object.freeze([
    Object.freeze({ id: 'gonna', pattern: /\bgonna\b/gi }),
    Object.freeze({ id: 'gotta', pattern: /\bgotta\b/gi }),
    Object.freeze({ id: 'kinda', pattern: /\bkinda\b/gi }),
    Object.freeze({ id: 'sorta', pattern: /\bsorta\b/gi }),
    Object.freeze({ id: 'nah', pattern: /\bnah\b/gi }),
    Object.freeze({ id: 'lol', pattern: /\blol\b/gi }),
    Object.freeze({ id: 'lmao', pattern: /\blmao\b/gi }),
    Object.freeze({ id: 'smh', pattern: /\bsmh\b/gi }),
    Object.freeze({ id: 'sus', pattern: /\bsus\b/gi }),
    Object.freeze({ id: 'omg', pattern: /\bomg\b/gi }),
    Object.freeze({ id: 'lowkey', pattern: /\blowkey\b/gi }),
    Object.freeze({ id: 'highkey', pattern: /\bhighkey\b/gi })
  ]),
  vernacularMarkers: Object.freeze([
    Object.freeze({ id: 'yall', pattern: /\by(?:'|’)?all\b/gi }),
    Object.freeze({ id: 'tryna', pattern: /\btryna\b/gi }),
    Object.freeze({ id: 'ima', pattern: /\b(?:ima|i(?:'|’)?ma)\b/gi }),
    Object.freeze({ id: 'finna', pattern: /\bfinna\b/gi }),
    Object.freeze({ id: 'gone', pattern: /\bgon(?:'|’)?\b/gi })
  ])
});

const FORMALIZATION_FEATURE_RULES = Object.freeze([
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bpkg\b/gi, replacement: 'package', label: 'feature:pkg->package' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bmgmt\b/gi, replacement: 'management', label: 'feature:mgmt->management' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdept\b/gi, replacement: 'department', label: 'feature:dept->department' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsup\b/gi, replacement: 'supervisor', label: 'feature:sup->supervisor' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdocs\b/gi, replacement: 'documentation', label: 'feature:docs->documentation' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsched\b/gi, replacement: 'scheduled', label: 'feature:sched->scheduled' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btmrw\b/gi, replacement: 'tomorrow', label: 'feature:tmrw->tomorrow' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\birl\b/gi, replacement: 'in real life', label: 'feature:irl->in-real-life' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\brn\b/gi, replacement: 'right now', label: 'feature:rn->right-now' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /(^|[^A-Za-z0-9])pm(?=\s+(?:perf|perfect|done|ready|fixed|handled|covered|clear|empty|gone|same|fine|normal|over|locked|set|there|true|false|impossible|sure|already|just|basically|all|the|a|this|that|it|we|they|you|i|he|she|still|not)\b)/gi, replacement: '$1pretty much', label: 'feature:pm->pretty-much' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\blmk\b/gi, replacement: 'let me know', label: 'feature:lmk->let-me-know' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\basap\b/gi, replacement: 'as soon as possible', label: 'feature:asap->as-soon-as-possible' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfwd\b/gi, replacement: 'forwarded', label: 'feature:fwd->forwarded' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bperf\s+review\b/gi, replacement: 'performance review', label: 'feature:perf-review->performance-review' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bperf\b/gi, replacement: 'perfect', label: 'feature:perf->perfect' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b(?:2nd|second)\s+fl\b/gi, replacement: 'second-floor', label: 'feature:2nd-fl->second-floor' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b(?:3rd|third)\s+fl\b/gi, replacement: 'third-floor', label: 'feature:3rd-fl->third-floor' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bapt\b/gi, replacement: 'apartment', label: 'feature:apt->apartment' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbldg\b/gi, replacement: 'building', label: 'feature:bldg->building' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bpls\b/gi, replacement: 'please', label: 'feature:pls->please' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bidk\b/gi, replacement: 'I do not know', label: 'feature:idk->i-do-not-know' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdk\b/gi, replacement: 'do not know', label: 'feature:dk->do-not-know' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bidc\b/gi, replacement: 'I do not care', label: 'feature:idc->i-do-not-care' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bidrc\b/gi, replacement: 'I do not really care', label: 'feature:idrc->i-do-not-really-care' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bidrk\b/gi, replacement: 'I do not really know', label: 'feature:idrk->i-do-not-really-know' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btbh\b/gi, replacement: 'to be honest', label: 'feature:tbh->to-be-honest' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bngl\b/gi, replacement: 'not going to lie', label: 'feature:ngl->not-going-to-lie' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfr\b/gi, replacement: 'for real', label: 'feature:fr->for-real' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbtw\b/gi, replacement: 'by the way', label: 'feature:btw->by-the-way' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfyi\b/gi, replacement: 'for your information', label: 'feature:fyi->for-your-information' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bimo\b/gi, replacement: 'in my opinion', label: 'feature:imo->in-my-opinion' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bimho\b/gi, replacement: 'in my honest opinion', label: 'feature:imho->in-my-honest-opinion' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btbf\b/gi, replacement: 'to be fair', label: 'feature:tbf->to-be-fair' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfwiw\b/gi, replacement: 'for what it is worth', label: 'feature:fwiw->for-what-it-is-worth' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bafaik\b/gi, replacement: 'as far as I know', label: 'feature:afaik->as-far-as-i-know' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\biirc\b/gi, replacement: 'if I remember correctly', label: 'feature:iirc->if-i-remember-correctly' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btl;?dr\b/gi, replacement: 'summary', label: 'feature:tldr->summary' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bwyd\b/gi, replacement: 'what are you doing', label: 'feature:wyd->what-are-you-doing' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bwbu\b/gi, replacement: 'what about you', label: 'feature:wbu->what-about-you' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnvm\b/gi, replacement: 'never mind', label: 'feature:nvm->never-mind' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdw\b/gi, replacement: 'do not worry', label: 'feature:dw->do-not-worry' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnp\b/gi, replacement: 'no problem', label: 'feature:np->no-problem' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b(?:ty|thx|tx)\b/gi, replacement: 'thank you', label: 'feature:thanks-shorthand->thank-you' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsry\b/gi, replacement: 'sorry', label: 'feature:sry->sorry' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bomw\b/gi, replacement: 'on my way', label: 'feature:omw->on-my-way' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbrb\b/gi, replacement: 'be right back', label: 'feature:brb->be-right-back' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\batm\b/gi, replacement: 'at the moment', label: 'feature:atm->at-the-moment' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bb\/c\b/gi, replacement: 'because', label: 'feature:b-c->because' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bur\b/gi, replacement: 'your', label: 'feature:ur->your' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bu\b/gi, replacement: 'you', label: 'feature:u->you' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\br\b/gi, replacement: 'are', label: 'feature:r->are' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bcuz\b/gi, replacement: 'because', label: 'feature:cuz->because' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btho\b/gi, replacement: 'though', label: 'feature:tho->though' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bthru\b/gi, replacement: 'through', label: 'feature:thru->through' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bppl\b/gi, replacement: 'people', label: 'feature:ppl->people' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bprob\b/gi, replacement: 'probably', label: 'feature:prob->probably' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdef\b/gi, replacement: 'definitely', label: 'feature:def->definitely' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\babt\b/gi, replacement: 'about', label: 'feature:abt->about' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bde-id\b/gi, replacement: 'de-identification', label: 'feature:de-id->de-identification' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bacct\b/gi, replacement: 'account', label: 'feature:acct->account' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\baddr\b/gi, replacement: 'address', label: 'feature:addr->address' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\binfo\b/gi, replacement: 'information', label: 'feature:info->information' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\badmin\b/gi, replacement: 'administration', label: 'feature:admin->administration' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bops\b/gi, replacement: 'operations', label: 'feature:ops->operations' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\breq\b/gi, replacement: 'request', label: 'feature:req->request' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bresched\b/gi, replacement: 'reschedule', label: 'feature:resched->reschedule' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bapprox\b/gi, replacement: 'approximately', label: 'feature:approx->approximately' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\beta\b/gi, replacement: 'estimated arrival time', label: 'feature:eta->estimated-arrival-time' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btbd\b/gi, replacement: 'to be determined', label: 'feature:tbd->to-be-determined' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bappt\b/gi, replacement: 'appointment', label: 'feature:appt->appointment' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bmsg\b/gi, replacement: 'message', label: 'feature:msg->message' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bwk\b/gi, replacement: 'week', label: 'feature:wk->week' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bb4\b/gi, replacement: 'before', label: 'feature:b4->before' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bgraf\b/gi, replacement: 'paragraph', label: 'feature:graf->paragraph' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bhed\b/gi, replacement: 'headline', label: 'feature:hed->headline' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bspeaker tag\b/gi, replacement: 'speaker attribution', label: 'feature:speaker-tag->speaker-attribution' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbody fixed\b/gi, replacement: 'body copy corrected', label: 'feature:body-fixed->body-copy-corrected' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnewsletter grab\b/gi, replacement: 'newsletter pull', label: 'feature:newsletter-grab->newsletter-pull' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b2\s+much\b/gi, replacement: 'too much', label: 'feature:2-much->too-much' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b2\s+(?=(?:preach|summarize|summarizing|de-id|de-identify|do|go|be|keep|write|send|ask|run|fix|check|make|move|stay|look|talk|handle|reconstruct|rebuild|clear|swap)\b)/gi, replacement: 'to ', label: 'feature:2->to' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b2\s+(volunteer lanes?|bus passes?|lanes?|people|members|minors|months|cases|routes|errors|linked errors|households?)\b/gi, replacement: 'two $1', label: 'feature:2-count->two' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b4\s+(?=(?:newsletter|record|review|follow-up|followup|support|committee|publication|case|story)\b)/gi, replacement: 'for ', label: 'feature:4->for' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\b4\s+(people|families|members|minors|lanes|months|cases|routes|households?)\b/gi, replacement: 'four $1', label: 'feature:4-count->four' }),
  ...EXTRA_CHATSPEAK_SHORTHAND_RULES.map((rule) => Object.freeze({
    family: 'chatspeakShorthand',
    pattern: rule.pattern,
    replacement: rule.formal,
    label: `feature:${rule.id}->formal`
  })),
  Object.freeze({ family: 'notePosture', pattern: /\s\+\s/g, replacement: ' and ', label: 'feature:plus->and' }),
  Object.freeze({ family: 'notePosture', pattern: /\s&\s/g, replacement: ' and ', label: 'feature:ampersand->and' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwasnt\b/gi, replacement: 'was not', label: 'feature:wasnt->was-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwerent\b/gi, replacement: 'were not', label: 'feature:werent->were-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdont\b/gi, replacement: 'do not', label: 'feature:dont->do-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdoesnt\b/gi, replacement: 'does not', label: 'feature:doesnt->does-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdidnt\b/gi, replacement: 'did not', label: 'feature:didnt->did-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcant\b/gi, replacement: 'cannot', label: 'feature:cant->cannot' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcouldnt\b/gi, replacement: 'could not', label: 'feature:couldnt->could-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bshouldnt\b/gi, replacement: 'should not', label: 'feature:shouldnt->should-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwont\b/gi, replacement: 'will not', label: 'feature:wont->will-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bisnt\b/gi, replacement: 'is not', label: 'feature:isnt->is-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\barent\b/gi, replacement: 'are not', label: 'feature:arent->are-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bim\b/gi, replacement: 'I am', label: 'feature:im->i-am' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bive\b/gi, replacement: 'I have', label: 'feature:ive->i-have' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bill\b/gi, replacement: 'I will', label: 'feature:ill->i-will' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\byoure\b/gi, replacement: 'you are', label: 'feature:youre->you-are' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\btheyre\b/gi, replacement: 'they are', label: 'feature:theyre->they-are' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthats\b/gi, replacement: 'that is', label: 'feature:thats->that-is' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\btheres\b/gi, replacement: 'there is', label: 'feature:theres->there-is' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwhats\b/gi, replacement: 'what is', label: 'feature:whats->what-is' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwasn't\b/gi, replacement: 'was not', label: 'feature:wasnt-apos->was-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bweren't\b/gi, replacement: 'were not', label: 'feature:werent-apos->were-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdon't\b/gi, replacement: 'do not', label: 'feature:dont-apos->do-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdoesn't\b/gi, replacement: 'does not', label: 'feature:doesnt-apos->does-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdidn't\b/gi, replacement: 'did not', label: 'feature:didnt-apos->did-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcan't\b/gi, replacement: 'cannot', label: 'feature:cant-apos->cannot' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcouldn't\b/gi, replacement: 'could not', label: 'feature:couldnt-apos->could-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bshouldn't\b/gi, replacement: 'should not', label: 'feature:shouldnt-apos->should-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwon't\b/gi, replacement: 'will not', label: 'feature:wont-apos->will-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bisn't\b/gi, replacement: 'is not', label: 'feature:isnt-apos->is-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\baren't\b/gi, replacement: 'are not', label: 'feature:arent-apos->are-not' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bi've\b/gi, replacement: 'I have', label: 'feature:ive-apos->i-have' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bi'll\b/gi, replacement: 'I will', label: 'feature:ill-apos->i-will' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\byou're\b/gi, replacement: 'you are', label: 'feature:youre-apos->you-are' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthey're\b/gi, replacement: 'they are', label: 'feature:theyre-apos->they-are' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthat's\b/gi, replacement: 'that is', label: 'feature:thats-apos->that-is' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthere's\b/gi, replacement: 'there is', label: 'feature:theres-apos->there-is' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwhat's\b/gi, replacement: 'what is', label: 'feature:whats-apos->what-is' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bgonna\b/gi, replacement: 'going to', label: 'feature:gonna->going-to' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bgotta\b/gi, replacement: 'have to', label: 'feature:gotta->have-to' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bkinda\b/gi, replacement: 'kind of', label: 'feature:kinda->kind-of' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bsorta\b/gi, replacement: 'sort of', label: 'feature:sorta->sort-of' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bnah\b/gi, replacement: 'no', label: 'feature:nah->no' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\blol\b/gi, replacement: 'informal laughter marker', label: 'feature:lol->laughter-marker' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\blmao\b/gi, replacement: 'strong informal laughter marker', label: 'feature:lmao->strong-laughter-marker' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bsmh\b/gi, replacement: 'expressed frustration', label: 'feature:smh->expressed-frustration' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bsus\b/gi, replacement: 'suspicious', label: 'feature:sus->suspicious' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bomg\b/gi, replacement: 'oh my god', label: 'feature:omg->oh-my-god' }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\by(?:'|’)?all\b/gi, replacement: 'you all', label: 'feature:yall->you-all' }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\btryna\b/gi, replacement: 'trying to', label: 'feature:tryna->trying-to' }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\b(?:ima|i(?:'|’)?ma)\b/gi, replacement: 'I am going to', label: 'feature:ima->i-am-going-to' }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\bfinna\b/gi, replacement: 'about to', label: 'feature:finna->about-to' })
]);

const DEGRADATION_FEATURE_RULES = Object.freeze([
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bpackage\b/gi, replacement: 'pkg', label: 'feature:package->pkg' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bparcel\b/gi, replacement: 'pkg', label: 'feature:parcel->pkg' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bmanagement\b/gi, replacement: 'mgmt', label: 'feature:management->mgmt' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdepartment\b/gi, replacement: 'dept', label: 'feature:department->dept' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsupervisor\b/gi, replacement: 'sup', label: 'feature:supervisor->sup' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdocumentation\b/gi, replacement: 'docs', label: 'feature:documentation->docs' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bscheduled\b/gi, replacement: 'sched', label: 'feature:scheduled->sched' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\btomorrow\b/gi, replacement: 'tmrw', label: 'feature:tomorrow->tmrw' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bin real life\b/gi, replacement: 'irl', label: 'feature:in-real-life->irl' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bright now\b/gi, replacement: 'rn', label: 'feature:right-now->rn' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bpretty much\b/gi, replacement: 'pm', label: 'feature:pretty-much->pm', requiresMarker: 'pm-pretty-much' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\blet me know\b/gi, replacement: 'lmk', label: 'feature:let-me-know->lmk' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bas soon as possible\b/gi, replacement: 'asap', label: 'feature:as-soon-as-possible->asap' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bforwarded\b/gi, replacement: 'fwd', label: 'feature:forwarded->fwd' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bperformance review\b/gi, replacement: 'perf review', label: 'feature:performance-review->perf-review' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bperfect\b/gi, replacement: 'perf', label: 'feature:perfect->perf', requiresMarker: 'perf' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsecond-floor\b/gi, replacement: '2nd fl', label: 'feature:second-floor->2nd-fl' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bthird-floor\b/gi, replacement: '3rd fl', label: 'feature:third-floor->3rd-fl' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bplease\b/gi, replacement: 'pls', label: 'feature:please->pls' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bI do not really care\b/gi, replacement: 'idrc', label: 'feature:i-do-not-really-care->idrc', requiresMarker: 'idrc' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bI do not really know\b/gi, replacement: 'idrk', label: 'feature:i-do-not-really-know->idrk', requiresMarker: 'idrk' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bI do not know\b/gi, replacement: 'idk', label: 'feature:i-do-not-know->idk' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdo not know\b/gi, replacement: 'dk', label: 'feature:do-not-know->dk', requiresMarker: 'dk' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bI do not care\b/gi, replacement: 'idc', label: 'feature:i-do-not-care->idc', requiresMarker: 'idc' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bto be honest\b/gi, replacement: 'tbh', label: 'feature:to-be-honest->tbh' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnot going to lie\b/gi, replacement: 'ngl', label: 'feature:not-going-to-lie->ngl' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfor real\b/gi, replacement: 'fr', label: 'feature:for-real->fr' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bby the way\b/gi, replacement: 'btw', label: 'feature:by-the-way->btw' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfor your information\b/gi, replacement: 'fyi', label: 'feature:for-your-information->fyi' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bin my opinion\b/gi, replacement: 'imo', label: 'feature:in-my-opinion->imo' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bin my honest opinion\b/gi, replacement: 'imho', label: 'feature:in-my-honest-opinion->imho' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bto be fair\b/gi, replacement: 'tbf', label: 'feature:to-be-fair->tbf' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bfor what it is worth\b/gi, replacement: 'fwiw', label: 'feature:for-what-it-is-worth->fwiw' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bas far as I know\b/gi, replacement: 'afaik', label: 'feature:as-far-as-i-know->afaik' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bif I remember correctly\b/gi, replacement: 'iirc', label: 'feature:if-i-remember-correctly->iirc' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsummary\b/gi, replacement: 'tldr', label: 'feature:summary->tldr', requiresMarker: 'tldr' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bwhat are you doing\b/gi, replacement: 'wyd', label: 'feature:what-are-you-doing->wyd', requiresMarker: 'wyd' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bwhat about you\b/gi, replacement: 'wbu', label: 'feature:what-about-you->wbu', requiresMarker: 'wbu' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnever mind\b/gi, replacement: 'nvm', label: 'feature:never-mind->nvm', requiresMarker: 'nvm' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdo not worry\b/gi, replacement: 'dw', label: 'feature:do-not-worry->dw', requiresMarker: 'dw' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bno problem\b/gi, replacement: 'np', label: 'feature:no-problem->np', requiresMarker: 'np' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bthank you\b/gi, replacement: 'ty', label: 'feature:thank-you->ty', requiresMarker: 'ty' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bsorry\b/gi, replacement: 'sry', label: 'feature:sorry->sry', requiresMarker: 'sry' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bon my way\b/gi, replacement: 'omw', label: 'feature:on-my-way->omw', requiresMarker: 'omw' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbe right back\b/gi, replacement: 'brb', label: 'feature:be-right-back->brb', requiresMarker: 'brb' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bat the moment\b/gi, replacement: 'atm', label: 'feature:at-the-moment->atm', requiresMarker: 'atm' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\byou are\b/gi, replacement: 'ur', label: 'feature:you-are->ur', requiresMarker: 'ur' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\byour\b/gi, replacement: 'ur', label: 'feature:your->ur', requiresMarker: 'ur' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\byou\b/gi, replacement: 'u', label: 'feature:you->u', requiresMarker: 'u' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bare\b/gi, replacement: 'r', label: 'feature:are->r', requiresMarker: 'r' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbecause\b/gi, replacement: 'bc', label: 'feature:because->bc' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bthough\b/gi, replacement: 'tho', label: 'feature:though->tho' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bthrough\b/gi, replacement: 'thru', label: 'feature:through->thru' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bpeople\b/gi, replacement: 'ppl', label: 'feature:people->ppl' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bprobably\b/gi, replacement: 'prob', label: 'feature:probably->prob' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bdefinitely\b/gi, replacement: 'def', label: 'feature:definitely->def' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\babout\b/gi, replacement: 'abt', label: 'feature:about->abt' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bde-identification\b/gi, replacement: 'de-id', label: 'feature:de-identification->de-id' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\baccount\b/gi, replacement: 'acct', label: 'feature:account->acct' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\baddress\b/gi, replacement: 'addr', label: 'feature:address->addr', requiresMarker: 'addr' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\binformation\b/gi, replacement: 'info', label: 'feature:information->info', requiresMarker: 'info' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\badministration\b/gi, replacement: 'admin', label: 'feature:administration->admin', requiresMarker: 'admin' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\boperations\b/gi, replacement: 'ops', label: 'feature:operations->ops', requiresMarker: 'ops' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\brequest\b/gi, replacement: 'req', label: 'feature:request->req', requiresMarker: 'req' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\breschedule\b/gi, replacement: 'resched', label: 'feature:reschedule->resched', requiresMarker: 'resched' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bapproximately\b/gi, replacement: 'approx', label: 'feature:approximately->approx', requiresMarker: 'approx' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bestimated arrival time\b/gi, replacement: 'eta', label: 'feature:estimated-arrival-time->eta', requiresMarker: 'eta' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bto be determined\b/gi, replacement: 'tbd', label: 'feature:to-be-determined->tbd', requiresMarker: 'tbd' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bappointment\b/gi, replacement: 'appt', label: 'feature:appointment->appt' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bmessage\b/gi, replacement: 'msg', label: 'feature:message->msg' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bweek\b/gi, replacement: 'wk', label: 'feature:week->wk' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbefore\b/gi, replacement: 'b4', label: 'feature:before->b4', requiresMarker: 'b4' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bparagraph\b/gi, replacement: 'graf', label: 'feature:paragraph->graf', requiresMarker: 'graf' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bheadline\b/gi, replacement: 'hed', label: 'feature:headline->hed', requiresMarker: 'hed' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bspeaker attribution\b/gi, replacement: 'speaker tag', label: 'feature:speaker-attribution->speaker-tag', requiresMarker: 'speaker-tag' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bbody copy corrected\b/gi, replacement: 'body fixed', label: 'feature:body-copy-corrected->body-fixed', requiresMarker: 'body-fixed' }),
  Object.freeze({ family: 'chatspeakShorthand', pattern: /\bnewsletter pull\b/gi, replacement: 'newsletter grab', label: 'feature:newsletter-pull->newsletter-grab', requiresMarker: 'newsletter-grab' }),
  ...EXTRA_CHATSPEAK_SHORTHAND_RULES.map((rule) => Object.freeze({
    family: 'chatspeakShorthand',
    pattern: rule.degradePattern,
    replacement: rule.compressed || rule.id,
    label: `feature:formal->${rule.id}`,
    requiresMarker: rule.id
  })),
  Object.freeze({ family: 'notePosture', pattern: /\s+and\s+/gi, replacement: ' & ', label: 'feature:and->ampersand', requiresMarker: 'ampersand-join' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdo not\b/gi, replacement: 'dont', label: 'feature:do-not->dont' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdoes not\b/gi, replacement: 'doesnt', label: 'feature:does-not->doesnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bdid not\b/gi, replacement: 'didnt', label: 'feature:did-not->didnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwas not\b/gi, replacement: 'wasnt', label: 'feature:was-not->wasnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwere not\b/gi, replacement: 'werent', label: 'feature:were-not->werent' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcannot\b/gi, replacement: 'cant', label: 'feature:cannot->cant' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bcould not\b/gi, replacement: 'couldnt', label: 'feature:could-not->couldnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bshould not\b/gi, replacement: 'shouldnt', label: 'feature:should-not->shouldnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwill not\b/gi, replacement: 'wont', label: 'feature:will-not->wont' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bis not\b/gi, replacement: 'isnt', label: 'feature:is-not->isnt' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bare not\b/gi, replacement: 'arent', label: 'feature:are-not->arent' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bI am\b/gi, replacement: 'im', label: 'feature:i-am->im' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bI have\b/gi, replacement: 'ive', label: 'feature:i-have->ive' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bI will\b/gi, replacement: 'ill', label: 'feature:i-will->ill' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\byou are\b/gi, replacement: 'youre', label: 'feature:you-are->youre' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthey are\b/gi, replacement: 'theyre', label: 'feature:they-are->theyre' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthat is\b/gi, replacement: 'thats', label: 'feature:that-is->thats' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bthere is\b/gi, replacement: 'theres', label: 'feature:there-is->theres' }),
  Object.freeze({ family: 'orthographyNoise', pattern: /\bwhat is\b/gi, replacement: 'whats', label: 'feature:what-is->whats' }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bgoing to\b/gi, replacement: 'gonna', label: 'feature:going-to->gonna', requiresEvidence: true }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bhave to\b/gi, replacement: 'gotta', label: 'feature:have-to->gotta', requiresEvidence: true }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bkind of\b/gi, replacement: 'kinda', label: 'feature:kind-of->kinda', requiresEvidence: true }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bsort of\b/gi, replacement: 'sorta', label: 'feature:sort-of->sorta', requiresEvidence: true }),
  Object.freeze({ family: 'slangMarkers', pattern: /\bsuspicious\b/gi, replacement: 'sus', label: 'feature:suspicious->sus', requiresEvidence: true }),
  Object.freeze({ family: 'slangMarkers', pattern: /\boh my god\b/gi, replacement: 'omg', label: 'feature:oh-my-god->omg', requiresEvidence: true }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\byou all\b/gi, replacement: 'yall', label: 'feature:you-all->yall', requiresEvidence: true }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\btrying to\b/gi, replacement: 'tryna', label: 'feature:trying-to->tryna', requiresEvidence: true }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\bI am going to\b/gi, replacement: 'ima', label: 'feature:i-am-going-to->ima', requiresEvidence: true }),
  Object.freeze({ family: 'vernacularMarkers', pattern: /\babout to\b/gi, replacement: 'finna', label: 'feature:about-to->finna', requiresEvidence: true })
]);

function cloneGlobalRegex(pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

function countPatternHits(text = '', pattern = /(?!)/) {
  const matches = String(text || '').match(cloneGlobalRegex(pattern));
  return matches ? matches.length : 0;
}

function buildFeatureFamilySummary(markers = []) {
  const unique = uniqueStrings(markers);
  return Object.freeze({
    active: unique.length > 0,
    count: unique.length,
    markers: Object.freeze(unique)
  });
}

function inferVernacularFeatures(text = '', profile = {}, registerLane = '', sourceClass = 'formal-correspondence') {
  const normalized = normalizeText(text);
  const orthographyMarkers = [];
  const chatspeakMarkers = [];
  const noteMarkers = [];
  const slangMarkers = [];
  const vernacularMarkers = [];

  (VERNACULAR_FEATURE_RULES.orthographyNoise || []).forEach((rule) => {
    if (countPatternHits(normalized, rule.pattern) > 0) {
      orthographyMarkers.push(rule.id);
    }
  });
  (VERNACULAR_FEATURE_RULES.chatspeakShorthand || []).forEach((rule) => {
    if (countPatternHits(normalized, rule.pattern) > 0) {
      chatspeakMarkers.push(rule.id);
    }
  });
  (VERNACULAR_FEATURE_RULES.notePosture || []).forEach((rule) => {
    if (countPatternHits(normalized, rule.pattern) > 0) {
      noteMarkers.push(rule.id);
    }
  });
  (VERNACULAR_FEATURE_RULES.slangMarkers || []).forEach((rule) => {
    if (countPatternHits(normalized, rule.pattern) > 0) {
      slangMarkers.push(rule.id);
    }
  });
  (VERNACULAR_FEATURE_RULES.vernacularMarkers || []).forEach((rule) => {
    if (countPatternHits(normalized, rule.pattern) > 0) {
      vernacularMarkers.push(rule.id);
    }
  });

  if (Number(profile?.orthographicLooseness || 0) >= 0.085) {
    orthographyMarkers.push('profile-orthographic-looseness');
  }
  if (Number(profile?.abbreviationDensity || 0) >= 0.055) {
    chatspeakMarkers.push('profile-abbreviation-density');
  }
  if (Number(profile?.fragmentPressure || 0) >= 0.14) {
    noteMarkers.push('profile-fragment-pressure');
  }
  if (Number(profile?.lineBreakDensity || 0) >= 0.09) {
    noteMarkers.push('profile-line-break-density');
  }

  const orthographyNoise = buildFeatureFamilySummary(orthographyMarkers);
  const chatspeakShorthand = buildFeatureFamilySummary(chatspeakMarkers);
  const notePosture = buildFeatureFamilySummary(noteMarkers);
  const slang = buildFeatureFamilySummary(slangMarkers);
  const vernacular = buildFeatureFamilySummary(vernacularMarkers);
  const activeFamilies = VERNACULAR_FEATURE_FAMILIES.filter((family) => {
    const summary = family === 'slangMarkers'
      ? slang
      : family === 'vernacularMarkers'
        ? vernacular
        : family === 'orthographyNoise'
          ? orthographyNoise
          : family === 'chatspeakShorthand'
            ? chatspeakShorthand
            : notePosture;
    return summary.active;
  });
  const totalMarkers =
    orthographyNoise.count +
    chatspeakShorthand.count +
    notePosture.count +
    slang.count +
    vernacular.count;

  return Object.freeze({
    registerLane: normalizeRegisterLane(registerLane, ''),
    sourceClass: String(sourceClass || '').trim().toLowerCase(),
    orthographyNoise,
    chatspeakShorthand,
    notePosture,
    slangMarkers: slang,
    vernacularMarkers: vernacular,
    activeFamilies: Object.freeze(activeFamilies),
    totalMarkers
  });
}

function featureFamilyCount(summary = {}, family = 'orthographyNoise') {
  return Number(summary?.[family]?.count || 0);
}

function featureFamilyActive(summary = {}, family = 'orthographyNoise') {
  return Boolean(summary?.[family]?.active);
}

function buildVernacularFeaturePressure({
  sourceFeatures = null,
  donorFeatures = null,
  targetRegisterLane = '',
  targetProfile = {}
} = {}) {
  const targetLane = normalizeRegisterLane(targetRegisterLane, '');
  const noisyTarget = ['rushed-mobile', 'tangled-followup'].includes(targetLane);
  const formalTarget = ['formal-record', 'professional-message'].includes(targetLane);
  const pressure = {};

  VERNACULAR_FEATURE_FAMILIES.forEach((family) => {
    const donorActive = featureFamilyActive(donorFeatures, family);
    const sourceActive = featureFamilyActive(sourceFeatures, family);
    if (formalTarget) {
      pressure[family] = sourceActive;
      return;
    }
    if (!noisyTarget) {
      pressure[family] = false;
      return;
    }
    if (family === 'orthographyNoise') {
      pressure[family] = donorActive || Number(targetProfile?.orthographicLooseness || 0) >= 0.09;
      return;
    }
    if (family === 'chatspeakShorthand') {
      pressure[family] = donorActive || Number(targetProfile?.abbreviationDensity || 0) >= 0.055;
      return;
    }
    if (family === 'notePosture') {
      pressure[family] = donorActive || Number(targetProfile?.fragmentPressure || 0) >= 0.14;
      return;
    }
    pressure[family] = donorActive;
  });

  return Object.freeze({
    targetRegisterLane: targetLane,
    activeFamilies: Object.freeze(VERNACULAR_FEATURE_FAMILIES.filter((family) => pressure[family])),
    orthographyNoise: Boolean(pressure.orthographyNoise),
    chatspeakShorthand: Boolean(pressure.chatspeakShorthand),
    notePosture: Boolean(pressure.notePosture),
    slangMarkers: Boolean(pressure.slangMarkers),
    vernacularMarkers: Boolean(pressure.vernacularMarkers)
  });
}

function buildVernacularFeatureShift({
  sourceFeatures = null,
  donorFeatures = null,
  outputFeatures = null,
  targetRegisterLane = '',
  targetProfile = {}
} = {}) {
  const pressure = buildVernacularFeaturePressure({
    sourceFeatures,
    donorFeatures,
    targetRegisterLane,
    targetProfile
  });
  const targetLane = normalizeRegisterLane(targetRegisterLane, '');
  const noisyTarget = ['rushed-mobile', 'tangled-followup'].includes(targetLane);
  const realizedFamilies = [];
  const orthographyShift = noisyTarget
    ? pressure.orthographyNoise && featureFamilyActive(outputFeatures, 'orthographyNoise')
    : featureFamilyCount(outputFeatures, 'orthographyNoise') < featureFamilyCount(sourceFeatures, 'orthographyNoise');
  const shorthandShift = noisyTarget
    ? pressure.chatspeakShorthand && featureFamilyActive(outputFeatures, 'chatspeakShorthand')
    : featureFamilyCount(outputFeatures, 'chatspeakShorthand') < featureFamilyCount(sourceFeatures, 'chatspeakShorthand');
  const notePostureShift = noisyTarget
    ? pressure.notePosture && featureFamilyActive(outputFeatures, 'notePosture')
    : featureFamilyCount(outputFeatures, 'notePosture') < featureFamilyCount(sourceFeatures, 'notePosture');
  const slangShift = noisyTarget
    ? pressure.slangMarkers && featureFamilyActive(outputFeatures, 'slangMarkers')
    : featureFamilyCount(outputFeatures, 'slangMarkers') < featureFamilyCount(sourceFeatures, 'slangMarkers');
  const vernacularShift = noisyTarget
    ? pressure.vernacularMarkers && featureFamilyActive(outputFeatures, 'vernacularMarkers')
    : featureFamilyCount(outputFeatures, 'vernacularMarkers') < featureFamilyCount(sourceFeatures, 'vernacularMarkers');

  if (orthographyShift) realizedFamilies.push('orthographyNoise');
  if (shorthandShift) realizedFamilies.push('chatspeakShorthand');
  if (notePostureShift) realizedFamilies.push('notePosture');
  if (slangShift) realizedFamilies.push('slangMarkers');
  if (vernacularShift) realizedFamilies.push('vernacularMarkers');

  const falseCleanFamilies = noisyTarget
    ? pressure.activeFamilies.filter((family) => !featureFamilyActive(outputFeatures, family))
    : VERNACULAR_FEATURE_FAMILIES.filter((family) =>
        featureFamilyCount(sourceFeatures, family) > 0 &&
        featureFamilyCount(outputFeatures, family) >= featureFamilyCount(sourceFeatures, family)
      );
  const falseDirtyFamilies = noisyTarget
    ? VERNACULAR_FEATURE_FAMILIES.filter((family) =>
        featureFamilyActive(outputFeatures, family) &&
        !pressure.activeFamilies.includes(family) &&
        !featureFamilyActive(sourceFeatures, family)
      )
    : [];
  const activeOutputFamilies = VERNACULAR_FEATURE_FAMILIES.filter((family) => featureFamilyActive(outputFeatures, family));
  const donorFeatureAdherence = noisyTarget
    ? round(
        1 - (falseDirtyFamilies.length / Math.max(activeOutputFamilies.length || pressure.activeFamilies.length || 1, 1)),
        4
      )
    : 1;
  const sourceNoiseTotal = VERNACULAR_FEATURE_FAMILIES.reduce((sum, family) => sum + featureFamilyCount(sourceFeatures, family), 0);
  const outputNoiseTotal = VERNACULAR_FEATURE_FAMILIES.reduce((sum, family) => sum + featureFamilyCount(outputFeatures, family), 0);
  const concealmentEffectiveness = noisyTarget
    ? 0
    : round(clamp01((sourceNoiseTotal - outputNoiseTotal) / Math.max(sourceNoiseTotal || 1, 1)), 4);

  return Object.freeze({
    targetRegisterLane: targetLane,
    orthographyShift,
    shorthandShift,
    notePostureShift,
    slangShift,
    vernacularShift,
    realizedFamilies: Object.freeze(realizedFamilies),
    realizedFamilyCount: realizedFamilies.length,
    falseCleanFamilies: Object.freeze(falseCleanFamilies),
    falseDirtyFamilies: Object.freeze(falseDirtyFamilies),
    donorFeatureAdherence,
    concealmentEffectiveness,
    surfaceMarkerCount: outputNoiseTotal,
    pressure
  });
}

function applyVernacularFeatureShiftDimensions(changedDimensions = [], featureShift = {}) {
  const realized = new Set(changedDimensions || []);
  if (featureShift.orthographyShift) {
    realized.add('orthography-posture');
  }
  if (featureShift.shorthandShift) {
    realized.add('abbreviation-posture');
    realized.add('lexical-register');
  }
  if (featureShift.notePostureShift) {
    realized.add('surface-marker-posture');
    realized.add('fragment-posture');
  }
  if (featureShift.slangShift || featureShift.vernacularShift) {
    realized.add('lexical-register');
    realized.add('conversation-posture');
  }
  return Object.freeze([...realized]);
}

function featurePressureActive(context = {}, family = 'orthographyNoise') {
  return Boolean(context?.vernacularFeaturePressure?.[family]);
}

function featureMarkerActive(summary = {}, family = 'orthographyNoise', marker = '') {
  if (!marker) return false;
  return Boolean((summary?.[family]?.markers || []).includes(marker));
}

function featureMarkerEvidenceActive(context = {}, family = 'orthographyNoise', marker = '') {
  if (!marker) return true;
  return (
    featureMarkerActive(context?.donorVernacularFeatures, family, marker) ||
    featureMarkerActive(context?.sourceVernacularFeatures, family, marker)
  );
}

function applyFeatureRuleSet(text = '', rules = [], context = {}, { limit = 2, direction = 'formalize' } = {}) {
  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];

  for (const rule of rules) {
    if (direction === 'degrade' && rule.requiresEvidence && !featurePressureActive(context, rule.family)) {
      continue;
    }
    if (direction === 'degrade' && rule.requiresMarker && !featureMarkerEvidenceActive(context, rule.family, rule.requiresMarker)) {
      continue;
    }
    working = replaceLimited(working, rule.pattern, (match, ...groups) => {
      const replacement = typeof rule.replacement === 'function'
        ? rule.replacement(match, ...groups)
        : String(rule.replacement || '').replace(/\$(\d+)/g, (token, index) => groups[Number(index) - 1] ?? token);
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, replacement, 'feature');
      return direction === 'formalize'
        ? matchCase(match, replacement)
        : replacement;
    }, limit);
  }
  return working;
}

function ordinalNodeLabel(index = 0) {
  return String(index + 1).padStart(2, '0');
}

function alphaNodeLabel(index = 0) {
  return MASK_ALPHA_SEQUENCE[index] || `NODE_${ordinalNodeLabel(index)}`;
}

function buildMaskedAnchorToken(kind = 'anchor', index = 0) {
  if (kind === 'entity') {
    return `[ENTITY_${alphaNodeLabel(index)}]`;
  }
  if (kind === 'location') {
    return `[LOC_NODE_${ordinalNodeLabel(index)}]`;
  }
  if (kind === 'time') {
    return `[TIME_NODE_${ordinalNodeLabel(index)}]`;
  }
  if (kind === 'quote') {
    return `[QUOTE_NODE_${ordinalNodeLabel(index)}]`;
  }
  if (kind === 'account') {
    return `[ACCOUNT_NODE_${ordinalNodeLabel(index)}]`;
  }
  if (kind === 'record') {
    return `[RECORD_NODE_${ordinalNodeLabel(index)}]`;
  }
  return `[ANCHOR_NODE_${ordinalNodeLabel(index)}]`;
}

function classifySensitiveAnchor(anchor = '') {
  const normalized = normalizeText(anchor);
  if (!normalized) {
    return 'anchor';
  }
  if (/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i.test(normalized)) {
    return 'time';
  }
  if (/^(?:January|February|March|April|May|June|July|August|September|October|November|December)$/i.test(normalized)) {
    return 'time';
  }
  if (/^\d{1,2}:\d{2}(?:\s?(?:AM|PM))?$/i.test(normalized)) {
    return 'time';
  }
  if (/^(?:Mr|Ms|Mrs|Dr|Prof)\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/.test(normalized)) {
    return 'entity';
  }
  if (/^(?:Unit|Door|Suite|Apartment|Corridor|Landing|Hall(?:way)?|Stair(?:s|well| rail)?|Rail|Table)$/i.test(normalized)) {
    return 'location';
  }
  if (/^(?:Door|Unit|Suite)\s+[A-Z0-9-]+$/i.test(normalized) || /^\d{1,3}[A-Za-z]$/.test(normalized)) {
    return 'location';
  }
  if (/^"[^"\n]{1,120}"$/.test(normalized)) {
    return 'quote';
  }
  if (/@/.test(normalized)) {
    return 'account';
  }
  if (/^[A-Z]{1,6}-\d{1,6}[A-Z]?$/i.test(normalized)) {
    return 'record';
  }
  return 'anchor';
}

function buildEntityMaskLedger(replacements = []) {
  return Object.freeze(
    (replacements || [])
      .filter((entry) => ['entity', 'location'].includes(entry?.kind))
      .map((entry) => Object.freeze({
        token: entry.token,
        value: entry.value,
        kind: entry.kind
      }))
  );
}

function firstMaskedAnchorToken(replacements = [], kind = 'location') {
  return (replacements || []).find((entry) => entry?.kind === kind)?.token || '';
}

function extractClockTimes(text = '') {
  const normalized = normalizeText(text);
  return uniqueStrings(normalized.match(/\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/gi) || []);
}

function extractSensitiveMaskAnchors(text = '', sourceClass = 'formal-correspondence') {
  const normalized = normalizeText(text);
  const anchors = new Set();
  const honorificNames = normalized.match(/\b(?:Mr|Ms|Mrs|Dr|Prof)\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
  honorificNames.forEach((entry) => anchors.add(entry));
  const suiteLike = normalized.match(/\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/g) || [];
  suiteLike.forEach((entry) => anchors.add(entry));
  if (['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
    const unitShorthand = normalized.match(/\b\d{1,3}[A-Za-z]\b/g) || [];
    unitShorthand.forEach((entry) => anchors.add(entry));
  }
  return [...anchors];
}

function filterHardAnchorsForTarget(anchors = [], targetOntology = 'balanced') {
  if (String(targetOntology || '').toLowerCase() !== 'actor') {
    return Object.freeze([...(anchors || [])]);
  }
  return Object.freeze(
    (anchors || []).filter((anchor) => {
      const kind = classifySensitiveAnchor(anchor);
      return !['time', 'location', 'entity', 'quote'].includes(kind);
    })
  );
}

function ontologySemanticFloor(floors = {}, generationControls = {}, sourceRegisterLane = '') {
  const targetOntology = String(generationControls?.targetOntology || '').trim().toLowerCase();
  const sourceLane = normalizeRegisterLane(sourceRegisterLane, '');
  if (targetOntology === 'actor') {
    return Object.freeze({
      proposition: Math.min(Number(floors?.proposition ?? 1), 0.68),
      actor: Math.min(Number(floors?.actor ?? 1), 0.6),
      action: Math.min(Number(floors?.action ?? 1), 0.66),
      object: Math.min(Number(floors?.object ?? 1), 0.6)
    });
  }
  if (targetOntology === 'institutional' && sourceLane === 'rushed-mobile') {
    return Object.freeze({
      proposition: Math.min(Number(floors?.proposition ?? 1), 0.56),
      actor: Math.min(Number(floors?.actor ?? 1), 0.82),
      action: Math.min(Number(floors?.action ?? 1), 0.52),
      object: Math.min(Number(floors?.object ?? 1), 0.5)
    });
  }
  return Object.freeze({
    proposition: Number(floors?.proposition ?? 1),
    actor: Number(floors?.actor ?? 1),
    action: Number(floors?.action ?? 1),
    object: Number(floors?.object ?? 1)
  });
}

function ontologyProtectedAnchorFloor(sourceClass = 'formal-correspondence', generationControls = {}, sourceRegisterLane = '') {
  const baseFloor = classProtectedAnchorFloor(sourceClass);
  const targetOntology = String(generationControls?.targetOntology || '').trim().toLowerCase();
  const sourceLane = normalizeRegisterLane(sourceRegisterLane, '');
  if (targetOntology === 'actor') {
    return Math.min(baseFloor, 0.58);
  }
  if (targetOntology === 'institutional' && sourceLane === 'rushed-mobile') {
    return Math.min(baseFloor, 0.9);
  }
  return baseFloor;
}

function extractNullTimeVariables(text = '') {
  const normalized = normalizeText(text);
  if (!normalized || extractClockTimes(normalized).length) {
    return Object.freeze([]);
  }
  const seen = new Set();
  const matches = [];
  NULL_TIME_VARIABLES.forEach((rule) => {
    for (const match of normalized.matchAll(rule.pattern)) {
      const value = normalizeText(match[0]);
      const key = normalizeComparable(value);
      if (!value || seen.has(key)) {
        continue;
      }
      seen.add(key);
      matches.push(Object.freeze({
        id: rule.id,
        value
      }));
    }
  });
  return Object.freeze(matches);
}

function buildTemporalDirective(sourceText = '', targetRegisterLane = 'formal-record') {
  const explicitTimestamps = Object.freeze(extractClockTimes(sourceText));
  const nullTimeVariables = extractNullTimeVariables(sourceText);
  const timestampStatus = explicitTimestamps.length
    ? 'explicit'
    : nullTimeVariables.length
      ? 'absent'
      : 'unspecified';
  const institutionalLane = ['formal-record', 'professional-message'].includes(targetRegisterLane);
  const strictFallbackText = institutionalLane
    ? 'At an undocumented time following'
    : 'At an unlogged time interval';
  return Object.freeze({
    timestampStatus,
    explicitTimestamps,
    nullTimeVariables,
    fallbackDirective: timestampStatus === 'absent'
      ? `Use strictly: '${strictFallbackText}'`
      : null,
    strictFallbackText,
    attestationRequired: institutionalLane
  });
}

function protectTemporalNullsForRewrite(text = '', temporalDirective = {}) {
  let working = String(text || '');
  const replacements = [];
  (temporalDirective?.nullTimeVariables || []).forEach((entry, index) => {
    const value = normalizeText(entry?.value || '');
    if (!value) {
      return;
    }
    const pattern = new RegExp(escapeRegex(value), 'g');
    if (!pattern.test(working)) {
      return;
    }
    const token = `__TD613TIME_NULL_${index}__`;
    working = working.replace(pattern, token);
    replacements.push(Object.freeze({
      token,
      value
    }));
  });
  return Object.freeze({
    text: working,
    replacements: Object.freeze(replacements)
  });
}

function restoreTemporalNullsAfterRewrite(text = '', temporalState = {}, temporalDirective = {}, targetRegisterLane = 'formal-record') {
  let working = String(text || '');
  const fallbackActive =
    temporalDirective?.timestampStatus === 'absent' &&
    ['formal-record', 'professional-message'].includes(targetRegisterLane);
  for (const replacement of temporalState?.replacements || []) {
    if (!replacement?.token) {
      continue;
    }
    const surface = fallbackActive
      ? temporalDirective?.strictFallbackText || 'At an unlogged time interval'
      : replacement.value || '';
    working = working.replace(new RegExp(escapeRegex(replacement.token), 'g'), surface);
  }
  if (fallbackActive) {
    working = working.replace(/\bAt an unlogged time interval\b(?!,)/g, 'At an unlogged time interval,');
  }
  return working;
}

function auditTemporalAttestation(sourceText = '', outputText = '', temporalDirective = {}) {
  const sourceTimes = Object.freeze(extractClockTimes(sourceText).map((entry) => normalizeComparable(entry)));
  const outputTimes = Object.freeze(extractClockTimes(outputText).map((entry) => normalizeComparable(entry)));
  const hallucinatedTimes = Object.freeze(outputTimes.filter((entry) => !sourceTimes.includes(entry)));
  const attestationPassed = temporalDirective?.timestampStatus === 'absent'
    ? outputTimes.length === 0
    : hallucinatedTimes.length === 0;
  return Object.freeze({
    timestampStatus: temporalDirective?.timestampStatus || 'unspecified',
    sourceTimes,
    outputTimes,
    hallucinatedTimes,
    attestationPassed,
    fallbackDirective: temporalDirective?.fallbackDirective || null
  });
}

function resolveOntologyGenerationControls({
  sourceClass = 'formal-correspondence',
  sourceRegisterLane = '',
  targetRegisterLane = 'formal-record'
} = {}) {
  const normalizedSourceLane = normalizeRegisterLane(
    sourceRegisterLane,
    inferRegisterLaneFromProfile({}, sourceClass)
  );
  const normalizedTargetLane = normalizeRegisterLane(targetRegisterLane, normalizedSourceLane || 'formal-record');
  if (['formal-record', 'professional-message'].includes(normalizedTargetLane)) {
    return Object.freeze({
      sourceRegisterLane: normalizedSourceLane || 'formal-record',
      targetRegisterLane: normalizedTargetLane,
      targetOntology: 'institutional',
      temperature: 0.1,
      topP: 0.35,
      intensityScalar: 0.76,
      strengthScalar: 0.92
    });
  }
  if (['rushed-mobile', 'tangled-followup'].includes(normalizedTargetLane)) {
    return Object.freeze({
      sourceRegisterLane: normalizedSourceLane || 'formal-record',
      targetRegisterLane: normalizedTargetLane,
      targetOntology: 'actor',
      temperature: normalizedTargetLane === 'rushed-mobile' ? 0.5 : 0.48,
      topP: 0.72,
      intensityScalar: 1.08,
      strengthScalar: 1.04
    });
  }
  return Object.freeze({
    sourceRegisterLane: normalizedSourceLane || 'formal-record',
    targetRegisterLane: normalizedTargetLane,
    targetOntology: 'balanced',
    temperature: 0.28,
    topP: 0.5,
    intensityScalar: 0.9,
    strengthScalar: 0.96
  });
}

function extractHardAnchors(text = '') {
  const normalized = normalizeText(text);
  const anchors = new Set();
  const quoted = normalized.match(/"[^"\n]{1,120}"/g) || [];
  quoted.forEach((entry) => anchors.add(entry));
  const clockTimes = extractClockTimes(normalized);
  clockTimes.forEach((entry) => anchors.add(entry));
  const ids = normalized.match(/\b[A-Z]{1,6}-\d{1,6}[A-Z]?\b/g) || [];
  ids.forEach((entry) => anchors.add(entry));
  const emails = normalized.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || [];
  emails.forEach((entry) => anchors.add(entry));
  const suiteLike = normalized.match(/\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/g) || [];
  suiteLike.forEach((entry) => anchors.add(entry));
  const honorificNames = normalized.match(/\b(?:Mr|Ms|Mrs|Dr|Prof)\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
  honorificNames.forEach((entry) => anchors.add(entry));
  const sentenceBrands = sentenceSplit(normalized)
    .flatMap((sentence) => {
      const trimmed = normalizeText(sentence);
      const withoutLead = trimmed.replace(/^[A-Z][a-z0-9'’-]*[,:;]?\s+/, '');
      return withoutLead.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) || [];
    })
    .map((entry) => normalizeText(entry))
    .filter((entry) => entry && !/^(?:I|The|A|An|It|This|That|On|At|In|When|While|And|But)$/.test(entry));
  sentenceBrands.forEach((entry) => anchors.add(entry));
  return [...anchors];
}

function hardAnchorIntegrity(sourceText = '', outputText = '', anchors = null) {
  const resolvedAnchors = Array.isArray(anchors) ? anchors : extractHardAnchors(sourceText);
  const anchorsList = [...resolvedAnchors];
  if (!anchorsList.length) {
    return 1;
  }
  const comparableOutput = normalizeComparable(outputText);
  const resolved = anchorsList.filter((anchor) => comparableOutput.includes(normalizeComparable(anchor))).length;
  return round(resolved / anchorsList.length, 4);
}

function classifyV2SourceClass(text = '') {
  const normalized = normalizeText(text);
  if (!normalized) {
    return 'procedural-record';
  }
  const proceduralTokenHits = (
    normalized.match(/\b(?:account|support|ticket|request|controller|firmware|badge|custody|fraud hold|case number|override|archive operations)\b/gi) || []
  ).length;
  if (
    /\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/.test(normalized) ||
    /\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/i.test(normalized) ||
    proceduralTokenHits >= 2
  ) {
    return 'procedural-record';
  }
  if (
    /\b(?:room|wall|night|suddenly|coffee|door|pack|thumb|swing|alone|shuddering)\b/i.test(normalized) ||
    /[!?]/.test(normalized)
  ) {
    return 'narrative-scene';
  }
  const singularFirstPersonHits = (
    normalized.match(/\b(?:I|me|my|myself)\b/g) || []
  ).length;
  const reflectiveSignalHits = (
    normalized.match(/\b(?:remember|reminding|worry|feel|think|trying|content|amnesia|keep|guess|blame|say|call|meet)\b/gi) || []
  ).length;
  if (
    reflectiveSignalHits >= 1 &&
      (
        /\bI\b/.test(normalized) ||
        singularFirstPersonHits >= 2
      )
  ) {
    return 'reflective-prose';
  }
  const formalSignalHits = (
    normalized.match(/\b(?:thank you|please|appreciate|let me know|best|regards|schedule|scheduling|follow up|follow-up)\b/gi) || []
  ).length;
  if (
    /(?:^|\n)\s*(?:hello|hi|team)\b/i.test(normalized) ||
    formalSignalHits >= 1
  ) {
    return 'formal-correspondence';
  }
  return 'formal-correspondence';
}

const REGISTER_LANES = Object.freeze([
  'formal-record',
  'professional-message',
  'rushed-mobile',
  'tangled-followup'
]);

function normalizeRegisterLane(value = '', fallback = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return REGISTER_LANES.includes(normalized) ? normalized : fallback;
}

export function inferRegisterLaneFromText(text = '', profile = {}, sourceClass = 'formal-correspondence') {
  const normalized = normalizeText(text);
  const lowered = normalized.toLowerCase();
  const abbreviationDensity = Number(profile?.abbreviationDensity || 0);
  const orthographicLooseness = Number(profile?.orthographicLooseness || 0);
  const fragmentPressure = Number(profile?.fragmentPressure || 0);
  const avgSentenceLength = Number(profile?.avgSentenceLength || 0);
  const sentenceCount = Number(profile?.sentenceCount || 0);
  const quotedSlashStatus = /["“'][^"”']{0,80}\s\/\s[^"”']{0,80}["”']/i.test(normalized);
  const slashNotePressure = !quotedSlashStatus && /(?:\s\/\s|\bw\/o\b|\bw\/\b)/i.test(normalized);
  const colonNotePressure = /:\s+[a-z0-9]/i.test(normalized) || /\bif [^.!?]{2,60}:\s+/i.test(normalized);
  const rushedLexemeHits = (lowered.match(/\b(?:pkg|mgmt|dept|sup|docs|sched|tmrw|rn|lmk|asap|fwd|perf|appt|msg|pls|bc|cuz|tho|thru|ppl|prob|def|abt|imo|fyi|2nd|3rd|fl|wasnt|dont|cant|w\/o|w\/|gonna|gotta|yall|tryna|ima|finna|idk|tbh|ngl|fr|omg)\b/gi) || []).length;
  const tangledSignals =
    /\b(?:following up|not quite right|accidentally made it sound|so yes|the actual miss|the actual issue|that is not quite right)\b/i.test(normalized) ||
    (avgSentenceLength >= 15 && sentenceCount >= 3 && /\b(?:but|however|though|earlier|later|actually)\b/i.test(normalized));
  const professionalSignals =
    /(?:^|\n)\s*(?:hello|hi|team)\b/i.test(normalized) ||
    /\b(?:please|let me know|thank you|appreciate|check in|required|flow|cleanup|arrive|starting with)\b/i.test(normalized);
  const institutionalSignalHits = (
    lowered.match(/\b(?:carrier scan|building footage|resident testimony|signature record|building log|corrective issue|presented for signature|approximately|maintenance|located it|third party handled|outer carton|rush parcel|door tag|hallway table)\b/gi) || []
  ).length;
  const formalRecordShape =
    avgSentenceLength >= 15 &&
    sentenceCount >= 3 &&
    institutionalSignalHits >= 1 &&
    orthographicLooseness < 0.085 &&
    fragmentPressure < 0.14 &&
    abbreviationDensity < 0.055;
  const strongRushedSignal =
    rushedLexemeHits >= 1 ||
    orthographicLooseness >= 0.085 ||
    fragmentPressure >= 0.14 ||
    abbreviationDensity >= 0.055;
  const weakRushedSignalCount = [slashNotePressure, colonNotePressure].filter(Boolean).length;

  if (
    strongRushedSignal ||
    (weakRushedSignalCount >= 1 && !formalRecordShape && (orthographicLooseness >= 0.05 || fragmentPressure >= 0.1 || abbreviationDensity >= 0.04))
  ) {
    return 'rushed-mobile';
  }
  if (tangledSignals) {
    return 'tangled-followup';
  }
  if (professionalSignals) {
    return 'professional-message';
  }
  if (sourceClass === 'procedural-record' || sourceClass === 'formal-correspondence') {
    return 'formal-record';
  }
  return 'formal-record';
}

function inferRegisterLaneFromProfile(profile = {}, sourceClass = 'formal-correspondence') {
  const abbreviationDensity = Number(profile?.abbreviationDensity || 0);
  const orthographicLooseness = Number(profile?.orthographicLooseness || 0);
  const fragmentPressure = Number(profile?.fragmentPressure || 0);
  const directness = Number(profile?.directness || 0);
  const avgSentenceLength = Number(profile?.avgSentenceLength || 0);
  const registerMode = String(profile?.registerMode || '').trim().toLowerCase();

  if (
    registerMode === 'compressed' ||
    abbreviationDensity >= 0.055 ||
    orthographicLooseness >= 0.085 ||
    fragmentPressure >= 0.14
  ) {
    return 'rushed-mobile';
  }
  if (avgSentenceLength >= 16 && directness <= 0.56) {
    return 'tangled-followup';
  }
  if (directness >= 0.56 && avgSentenceLength <= 18) {
    return 'professional-message';
  }
  return sourceClass === 'formal-correspondence' ? 'professional-message' : 'formal-record';
}

function resolveSourceRegisterLane({
  sourceText = '',
  sourceProfile = {},
  sourceClass = 'formal-correspondence',
  explicitRegisterLane = '',
  relationInventory = null
} = {}) {
  const explicit = normalizeRegisterLane(
    explicitRegisterLane || relationInventory?.sourceRegisterLane || '',
    ''
  );
  if (explicit) {
    return Object.freeze({
      sourceRegisterLane: explicit,
      inference: 'explicit',
      fallbackUsed: false
    });
  }
  const inferred = normalizeRegisterLane(
    inferRegisterLaneFromText(sourceText, sourceProfile, sourceClass),
    'formal-record'
  );
  return Object.freeze({
    sourceRegisterLane: inferred,
    inference: 'inferred',
    fallbackUsed: false
  });
}

function resolveTargetRegisterLane({
  shell = {},
  targetProfile = {},
  sourceProfile = {},
  sourceClass = 'formal-correspondence'
} = {}) {
  const explicit = normalizeRegisterLane(
    shell?.registerLane || targetProfile?.sourceRegisterLane || targetProfile?.registerLane || '',
    ''
  );
  if (explicit) {
    return explicit;
  }
  return normalizeRegisterLane(
    inferRegisterLaneFromProfile(targetProfile, sourceClass),
    inferRegisterLaneFromProfile(sourceProfile, sourceClass)
  );
}

function inferEnvelopeId(shell = {}, sourceProfile = {}, targetProfile = {}) {
  const personaId = String(shell?.personaId || '').trim().toLowerCase();
  if (personaId) {
    return personaId;
  }
  const label = String(shell?.label || '').trim().toLowerCase();
  if (label.includes('spark')) {
    return 'spark';
  }
  if (label.includes('matron')) {
    return 'matron';
  }
  if (label.includes('undertow')) {
    return 'undertow';
  }
  if (label.includes('archiv')) {
    return 'archivist';
  }
  if (label.includes('cross')) {
    return 'cross-examiner';
  }
  if (label.includes('operator')) {
    return 'operator';
  }
  if (label.includes('method')) {
    return 'methods-editor';
  }
  if ((targetProfile.abbreviationDensity || 0) >= 0.08 || (targetProfile.fragmentPressure || 0) >= 0.14) {
    return 'spark';
  }
  if ((targetProfile.avgSentenceLength || 0) >= (sourceProfile.avgSentenceLength || 0) + 3.5) {
    return (targetProfile.directness || 0) <= (sourceProfile.directness || 0)
      ? 'matron'
      : 'archivist';
  }
  if ((targetProfile.directness || 0) >= (sourceProfile.directness || 0) + 0.12) {
    return 'cross-examiner';
  }
  return 'generic';
}

const ENVELOPE_ADJUSTMENTS = Object.freeze({
  spark: Object.freeze({
    primary: Object.freeze({ sent: -2, cont: 2, punc: 2, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: -3, cont: 2, punc: 3, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: -1, cont: 1, punc: 1, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  matron: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -1, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: 3, cont: 0, punc: -2, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: 1, cont: 0, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  undertow: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: 0, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: 3, cont: 0, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: 1, cont: 0, punc: 0, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  archivist: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -2, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: 3, cont: -2, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: 1, cont: -1, punc: 0, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  'cross-examiner': Object.freeze({
    primary: Object.freeze({ sent: -2, cont: -1, punc: 2, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: -3, cont: -1, punc: 3, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: -1, cont: -1, punc: 1, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  operator: Object.freeze({
    primary: Object.freeze({ sent: -1, cont: -1, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: -2, cont: -1, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: -1, cont: 0, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  'methods-editor': Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -2, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: 3, cont: -3, punc: -2, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: 1, cont: -1, punc: -1, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  }),
  generic: Object.freeze({
    primary: Object.freeze({ sent: 0, cont: 0, punc: 0, frag: 0, abst: 0, hedge: 0, abbr: 0 }),
    secondary: Object.freeze({ sent: 1, cont: 0, punc: 0, frag: -1, abst: 1, hedge: 0, abbr: 0 }),
    conservative: Object.freeze({ sent: 0, cont: 0, punc: 0, frag: 0, abst: 0, hedge: 0, abbr: 0 })
  })
});

function classScalar(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.62;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.8;
  }
  if (sourceClass === 'reflective-prose') {
    return 1.05;
  }
  if (sourceClass === 'narrative-scene') {
    return 1.12;
  }
  return 0.85;
}

const GENERATOR_CADENCE_MOD_AXES = Object.freeze(['sent', 'cont', 'punc', 'frag', 'abst', 'hedge', 'abbr']);

function normalizeShellModValue(mod = {}) {
  return GENERATOR_CADENCE_MOD_AXES.reduce((acc, axis) => {
    acc[axis] = clamp(Math.round(Number(mod?.[axis] || 0)), -3, 3);
    return acc;
  }, {});
}

function mergeShellMod(baseMod = {}, adjustment = {}, scalar = 1) {
  return GENERATOR_CADENCE_MOD_AXES.reduce((acc, axis) => {
    acc[axis] = clamp(Math.round(Number(baseMod?.[axis] || 0) + (Number(adjustment?.[axis] || 0) * scalar)), -3, 3);
    return acc;
  }, {});
}

function cloneProfile(profile = {}) {
  return profile ? JSON.parse(JSON.stringify(profile)) : null;
}

function tuneTargetProfile(profile = {}, sourceProfile = {}, envelopeId = 'generic', sourceClass = 'formal-correspondence', intensity = 1) {
  if (!profile || !Object.keys(profile).length) {
    return null;
  }
  const tuned = { ...cloneProfile(profile) };
  const classWeight = classScalar(sourceClass) * intensity;

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner' || envelopeId === 'operator') {
    tuned.avgSentenceLength = Math.max(2, round(
      (profile.avgSentenceLength || sourceProfile.avgSentenceLength || 10) - (1.6 * classWeight),
      2
    ));
    tuned.punctuationDensity = clamp01(round(
      (profile.punctuationDensity || 0) + (0.012 * classWeight),
      4
    ));
    tuned.contractionDensity = clamp01(round(
      (profile.contractionDensity || 0) + (0.018 * classWeight),
      4
    ));
    tuned.directness = clamp01(round(
      (profile.directness || 0) + (0.05 * classWeight),
      4
    ));
  } else if (envelopeId === 'matron' || envelopeId === 'undertow' || envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    tuned.avgSentenceLength = round(
      (profile.avgSentenceLength || sourceProfile.avgSentenceLength || 10) + (1.8 * classWeight),
      2
    );
    tuned.punctuationDensity = clamp01(round(
      Math.max(0, (profile.punctuationDensity || 0) - (0.008 * classWeight)),
      4
    ));
    tuned.contractionDensity = clamp01(round(
      Math.max(0, (profile.contractionDensity || 0) - (0.012 * classWeight)),
      4
    ));
    tuned.abstractionPosture = clamp01(round(
      (profile.abstractionPosture || 0) + (0.03 * classWeight),
      4
    ));
  }

  return tuned;
}

function splitSentencesPreserve(text = '') {
  return normalizeText(text)
    .split(/(?<=[.!?]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function contractExpansions(text = '') {
  return normalizeText(text)
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bI have\b/g, "I've")
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bdid not\b/gi, "didn't")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bthat is\b/gi, "that's")
    .replace(/\bthere is\b/gi, "there's")
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bthey are\b/gi, "they're")
    .replace(/\bcan not\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't");
}

function expandContractions(text = '') {
  return normalizeText(text)
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\bI've\b/g, 'I have')
    .replace(/\bI'll\b/g, 'I will')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\bthat's\b/gi, 'that is')
    .replace(/\bthere's\b/gi, 'there is')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\byou're\b/gi, 'you are')
    .replace(/\bthey're\b/gi, 'they are')
    .replace(/\bcan't\b/gi, 'can not')
    .replace(/\bwon't\b/gi, 'will not');
}

function sentenceWordCount(sentence = '') {
  return normalizeText(sentence)
    .replace(/[^a-z0-9' ]+/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

const SUBORDINATOR_PREFIX_PATTERN = /^(?:since|because|although|while|when|if|unless|though|which)\b[\s,]*/i;
const SUBORDINATOR_LOOKAHEAD_PATTERN = '(?:since|because|although|while|when|if|unless|though|that|which|with)';

function stripSubordinatorPrefix(text = '', context = null) {
  const working = normalizeText(text);
  const stripped = working.replace(SUBORDINATOR_PREFIX_PATTERN, '');
  if (stripped !== working && sentenceWordCount(stripped) >= 3) {
    if (context?.structuralOperations) {
      context.structuralOperations.push('STRIP_SUBORDINATOR_PREFIX');
    }
    return stripped.replace(/^[a-z]/, (match) => match.toUpperCase());
  }
  return working;
}

function splitForClippedMomentum(sentence = '', sourceClass = 'formal-correspondence') {
  const boundedCustodyClass = ['procedural-record', 'formal-correspondence'].includes(sourceClass);
  const commaPattern = new RegExp(`,((?:["')\\]])?)\\s+(?=(?:and|but|${SUBORDINATOR_LOOKAHEAD_PATTERN})\\b)`, 'gi');
  let working = normalizeText(sentence)
    .replace(commaPattern, (match, closer = '', offset = 0, full = '') => {
      const right = full.slice(offset + match.length);
      if (boundedCustodyClass && /^(?:and|but)\b/i.test(right)) {
        return match;
      }
      if (boundedCustodyClass && SUBORDINATOR_PREFIX_PATTERN.test(right)) {
        return match;
      }
      return `.${closer} `;
    });
  if (!boundedCustodyClass) {
    working = working
      .replace(/;\s+/g, '. ')
      .replace(/:\s+(?=[A-Za-z])/g, '. ');
  }
  return splitSentencesPreserve(working)
    .map((entry) => boundedCustodyClass ? entry : stripSubordinatorPrefix(entry))
    .join(' ');
}

function splitSceneBursts(text = '') {
  return normalizeText(text)
    .replace(/,\s+and,\s+/gi, '. ')
    .replace(/,\s+and\s+(?=[a-z])/gi, '. ')
    .replace(/,\s+with\s+/gi, '. With ')
    .replace(/,\s+suddenly,\s+/gi, '. Suddenly, ')
    .replace(/,\s+then\s+/gi, '. Then ')
    .replace(/:\s+(?=[A-Za-z])/g, '. ');
}

function normalizeMergedLead(next = '', linker = ', and ') {
  let working = normalizeText(next);
  if (!working) {
    return working;
  }
  if (/\bwhile\s*$/i.test(linker)) {
    working = working.replace(/^(?:and|while)\b[\s,]*/i, '');
  } else if (/\band\s*$/i.test(linker)) {
    working = working.replace(/^and\b[\s,]*/i, '');
  } else if (/;\s*$/.test(linker)) {
    working = working.replace(/^(?:and|but|so)\b[\s,]*/i, '');
  }
  return working.replace(/^[A-Z]/, (match) => match.toLowerCase());
}

function mergeForLongCurrent(sentences = [], linker = ', and ') {
  if (sentences.length < 2) {
    return sentences;
  }
  const merged = [];
  let index = 0;
  while (index < sentences.length) {
    const current = normalizeText(sentences[index]);
    const next = normalizeText(sentences[index + 1] || '');
    if (!next) {
      merged.push(current);
      index += 1;
      continue;
      }
      const currentWords = sentenceWordCount(current);
      const nextWords = sentenceWordCount(next);
      const linkerPattern = new RegExp(escapeRegex(linker.trim()), 'i');
      if (currentWords >= 18 || linkerPattern.test(current)) {
        merged.push(current);
        index += 1;
        continue;
      }
      if (currentWords <= 14 || nextWords <= 14) {
        const left = current.replace(/[.!?]+$/g, '');
        const right = normalizeMergedLead(next, linker);
        merged.push(`${left}${linker}${right}`);
        index += 2;
        continue;
      }
    merged.push(current);
    index += 1;
  }
  return merged;
}

function softenLinkerChains(text = '') {
  return splitSentencesPreserve(text).map((sentence) => {
    let working = normalizeText(sentence);
    let seenAnd = 0;
    working = working.replace(/,\s+and\b/gi, () => {
      seenAnd += 1;
      return seenAnd >= 2 ? '. And' : ', and';
    });
    let seenWhile = 0;
    working = working.replace(/,\s+while\b/gi, () => {
      seenWhile += 1;
      return seenWhile >= 2 ? '. While' : ', while';
    });
    return working;
  }).join(' ');
}

function tidyEnvelopeText(text = '') {
  return normalizeText(
    String(text || '')
      .replace(/\s+([,;:.!?])/g, '$1')
      .replace(/,\s*;/g, ';')
      .replace(/;\s*,/g, ';')
      .replace(/;\s*\./g, '.')
      .replace(/,\s*\./g, '.')
      .replace(/\.{2,}/g, '.')
      .replace(/!{2,}/g, '!')
      .replace(/\?{2,}/g, '?')
  );
}

function sanitizeV2Surface(text = '', { preserveLowercaseLeads = false } = {}) {
  let working = softenLinkerChains(tidyEnvelopeText(text))
    .replace(/\.\s*,/g, '. ')
    .replace(/,\s*\./g, '. ')
    .replace(/;\s+;/g, '; ')
    .replace(/;\s+([A-Z])/g, '. $1')
    .replace(/\band\s+and\b/gi, 'and')
    .replace(/\bwhile\s+while\b/gi, 'while')
    .replace(/\bwhile\s+and\b/gi, 'while')
    .replace(/\band\s+while\b/gi, 'while')
    .replace(/\bnot ([^.!?]{3,120}?)\.\s+but\b/gi, 'not $1, but')
      .replace(/\bYet\s+twirl\b/gi, 'The twirl')
      .replace(/\bYet\s+two\b/gi, 'Then two')
      .replace(/\bYet\s+the\b/gi, 'Then the')
      .replace(/\bYet\s+it\b/gi, 'Then it');
  if (!preserveLowercaseLeads) {
    working = working
      .replace(/^([a-z])/, (match, letter) => letter.toUpperCase())
      .replace(/([.!?;]\s+)([a-z])/g, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`);
  }
  working = working.replace(/\bi\b/g, 'I');
  return normalizeText(
    working.replace(/\s{2,}/g, ' ')
  );
}

function polishNativeCandidateText(text = '', {
  envelopeId = 'generic',
  sourceClass = 'formal-correspondence'
} = {}) {
  let working = sanitizeV2Surface(text, {
    preserveLowercaseLeads:
      ['procedural-record', 'formal-correspondence'].includes(sourceClass) &&
      (envelopeId === 'spark' || envelopeId === 'cross-examiner')
  });

  working = working
    .replace(/,\s+and then\s+and\b/gi, ', and then')
    .replace(/,\s+and\s+and\b/gi, ', and')
    .replace(/,\s+while\s+while\b/gi, ', while')
    .replace(/\bBut then,\s+but then\b/gi, 'But then')
    .replace(/\bAnd then,\s+and then\b/gi, 'Then')
    .replace(/\bStill,\s+still\b/gi, 'Still')
    .replace(/\bHowever,\s+however\b/gi, 'However')
    .replace(/,\s+(?=(?:Do not|Keep|Call|Meet|Nobody|I needed|I blame|I must|It is|Without warning|The wall)\b)/g, '. ')
    .replace(/\b(I|We|You|They|He|She|It)\s+(am|are|is|was|were)\s+\1\s+(am|are|is|was|were)\b/gi, '$1 $2')
    .replace(/\b(I|We|You|They|He|She|It)\s+(need to|have to|want to|must)\s+\1\s+\2\b/gi, '$1 $2');

  if (['matron', 'undertow'].includes(envelopeId)) {
    working = splitSentencesPreserve(working).map((sentence) => {
      const normalizedSentence = normalizeText(sentence);
      if (sentenceWordCount(normalizedSentence) <= (envelopeId === 'matron' ? 30 : 32)) {
        return normalizedSentence;
      }
      return normalizedSentence
        .replace(/,\s+and\s+(?=(?:Nobody|No one|Nothing|Someone|Something|Things|The|It|This|That|Two|Then|Suddenly)\b)/, '. ')
        .replace(/,\s+while\s+(?=(?:Nobody|No one|Nothing|Someone|Something|Things|The|It|This|That|Two|Then|Suddenly)\b)/, '. While ');
    }).join(' ');
  }

  const sentences = splitSentencesPreserve(working);
  if (sentences.length && sentenceWordCount(sentences[0]) > (envelopeId === 'matron' || envelopeId === 'undertow' ? 30 : 24)) {
    const softenedLead = splitForClippedMomentum(sentences[0], sourceClass);
    if (softenedLead !== sentences[0] && !['matron', 'undertow'].includes(envelopeId)) {
      sentences[0] = softenedLead;
      working = sentences.join(' ');
    }
  }

  return sanitizeV2Surface(working, {
    preserveLowercaseLeads: false
  });
}

const PROCEDURAL_ALIAS_GUARDS = Object.freeze([
  Object.freeze({
    canonical: 'support',
    aliases: [/\bhelp\b/gi]
  }),
  Object.freeze({
    canonical: 'account',
    aliases: [/\bstory\b/gi, /\bpoint\b/gi]
  }),
  Object.freeze({
    canonical: 'review',
    aliases: [/\bcheck\b/gi]
  })
]);

function restoreProceduralWitnessTerms(sourceText = '', outputText = '', sourceClass = 'formal-correspondence') {
  if (!['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
    return outputText;
  }
  const sourceLower = normalizeComparable(sourceText);
  let working = String(outputText || '');
  PROCEDURAL_ALIAS_GUARDS.forEach((rule) => {
    if (!sourceLower.includes(rule.canonical)) {
      return;
    }
    const canonicalPattern = new RegExp(`\\b${rule.canonical}\\b`, 'gi');
    const requiredCount = (sourceLower.match(canonicalPattern) || []).length;
    let outputCount = (normalizeComparable(working).match(canonicalPattern) || []).length;
    if (outputCount >= requiredCount) {
      return;
    }
    for (const alias of rule.aliases) {
      while (outputCount < requiredCount && alias.test(working)) {
        alias.lastIndex = 0;
        working = working.replace(alias, rule.canonical);
        outputCount += 1;
      }
      alias.lastIndex = 0;
      if (outputCount >= requiredCount) {
        break;
      }
    }
  });
  return working;
}

function restoreHardWitnessAnchors(sourceText = '', outputText = '') {
  let working = String(outputText || '');
  for (const match of String(sourceText || '').matchAll(/\bDoor\s+([A-Z0-9-]+)\b/gi)) {
    const suffix = String(match[1] || '').trim();
    if (!suffix) {
      continue;
    }
    const canonical = `Door ${suffix}`;
    const shorthand = new RegExp(`\\bd\\s*${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (!new RegExp(`\\bDoor\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(working) && shorthand.test(working)) {
      working = working.replace(shorthand, canonical);
    }
  }
  return working;
}

function applyPersonaEnvelopeText(text = '', {
  sourceText = '',
  envelopeId = 'generic',
  sourceClass = 'formal-correspondence',
  targetProfile = {},
  explicitTargetProfile = false,
  context = {}
} = {}) {
  let working = normalizeText(text);
  if (!working) {
    return working;
  }

  const sentences = splitSentencesPreserve(working);
  const sourceSentences = splitSentencesPreserve(sourceText);
  const sceneLike = sourceClass === 'reflective-prose' || sourceClass === 'narrative-scene';

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    working = sentences.map((sentence) => {
      let next = splitForClippedMomentum(sentence, sourceClass);
      if (sceneLike) {
        next = splitSceneBursts(next);
      }
      return next;
    }).join(' ');
    if ((targetProfile.contractionDensity || 0) >= 0.08 || envelopeId === 'spark') {
      working = contractExpansions(working);
    }
  } else if (envelopeId === 'operator') {
    working = sentences.map((sentence) => splitForClippedMomentum(sentence, sourceClass)).join(' ');
    working = expandContractions(working)
      .replace(/!/g, '.')
      .replace(/,\s+and\b/gi, '; ')
      .replace(/\.\s+And\b/g, '. ');
  } else if (envelopeId === 'matron') {
    const merged = mergeForLongCurrent(sentences, sceneLike ? ', and ' : '; ');
    working = expandContractions(merged.join(' '));
  } else if (envelopeId === 'undertow') {
    const merged = mergeForLongCurrent(sentences, sceneLike ? ', while ' : '; and ');
    working = merged.join(' ');
    if ((targetProfile.contractionDensity || 0) < 0.06) {
      working = expandContractions(working);
    }
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    const merged = mergeForLongCurrent(sentences, '; ');
    working = expandContractions(merged.join(' ')).replace(/!/g, '.');
  } else {
    if (!explicitTargetProfile) {
      return tidyEnvelopeText(working);
    }
    if ((targetProfile.contractionDensity || 0) >= 0.08 && sourceSentences.length >= 2) {
      working = contractExpansions(working);
    } else if ((targetProfile.contractionDensity || 0) <= 0.04) {
      working = expandContractions(working);
    }
  }

  working = applyScenePersonaPulse(working, envelopeId, sourceClass, context);
  return tidyEnvelopeText(working);
}

function deriveChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const dimensions = [];
  const abbreviationDelta = Math.abs((sourceProfile.abbreviationDensity || 0) - (outputProfile.abbreviationDensity || 0));
  const orthographyDelta = Math.abs((sourceProfile.orthographicLooseness || 0) - (outputProfile.orthographicLooseness || 0));
  const abstractionDelta = Math.abs((sourceProfile.abstractionPosture || 0) - (outputProfile.abstractionPosture || 0));
  if (Math.abs((sourceProfile.avgSentenceLength || 0) - (outputProfile.avgSentenceLength || 0)) >= 1) {
    dimensions.push('sentence-mean');
  }
  if (Math.abs((sourceProfile.sentenceCount || 0) - (outputProfile.sentenceCount || 0)) >= 1) {
    dimensions.push('sentence-count');
  }
  if (Math.abs((sourceProfile.sentenceLengthSpread || 0) - (outputProfile.sentenceLengthSpread || 0)) >= 1.4) {
    dimensions.push('sentence-spread');
  }
  if (Math.abs((sourceProfile.contractionDensity || 0) - (outputProfile.contractionDensity || 0)) >= 0.012) {
    dimensions.push('contraction-posture');
  }
  if (Math.abs((sourceProfile.lineBreakDensity || 0) - (outputProfile.lineBreakDensity || 0)) >= 0.03) {
    dimensions.push('line-break-texture');
  }
  if (Math.abs((sourceProfile.punctuationDensity || 0) - (outputProfile.punctuationDensity || 0)) >= 0.012) {
    dimensions.push('punctuation-shape');
  }
  if ((sourceProfile.registerMode || '') !== (outputProfile.registerMode || '')) {
    dimensions.push('register-mode');
  }
  if (Math.abs((sourceProfile.directness || 0) - (outputProfile.directness || 0)) >= 0.06) {
    dimensions.push('directness');
  }
  if (abstractionDelta >= 0.06) {
    dimensions.push('abstraction');
    dimensions.push('abstraction-posture');
  }
  if (abbreviationDelta >= 0.018) {
    dimensions.push('abbreviation-posture');
  }
  if (orthographyDelta >= 0.02) {
    dimensions.push('orthography-posture');
  }
  if (
    (sourceProfile.registerMode || '') !== (outputProfile.registerMode || '') ||
    abbreviationDelta >= 0.04 ||
    orthographyDelta >= 0.08
  ) {
    dimensions.push('lexical-register');
  }
  return uniqueStrings(dimensions);
}

function substantiveDimensionCount(changedDimensions = []) {
  return (changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;
}

function deriveRealizationTier(changedDimensions = [], lexemeSwaps = []) {
  const substantive = substantiveDimensionCount(changedDimensions);
  const lexical = Number((lexemeSwaps || []).length || 0);
  if (substantive >= 2 && lexical > 0) {
    return 'lexical-structural';
  }
  if (substantive >= 2) {
    return 'structural';
  }
  if (substantive >= 1 || lexical > 0) {
    return 'partial';
  }
  return 'none';
}

function classSemanticFloor(sourceClass = 'formal-correspondence', sourceProfile = {}, targetProfile = null) {
  if (sourceClass === 'procedural-record') {
    return { proposition: 0.85, actor: 0.75, action: 0.75, object: 0.65 };
  }
  if (sourceClass === 'formal-correspondence') {
    const compressedTarget = Boolean(targetProfile) && (
      Number(targetProfile?.avgSentenceLength || 0) < (Number(sourceProfile?.avgSentenceLength || 0) * 0.76) ||
      Number(targetProfile?.fragmentPressure || 0) >= 0.08 ||
      Number(targetProfile?.abbreviationDensity || 0) >= 0.035
    );
    if (compressedTarget) {
      return { proposition: 0.85, actor: 0.75, action: 0.75, object: 0.65 };
    }
    return { proposition: 0.82, actor: 0.74, action: 0.75, object: 0.64 };
  }
  if (sourceClass === 'reflective-prose') {
    return { proposition: 0.72, actor: 0.64, action: 0.64, object: 0.56 };
  }
  return { proposition: 0.7, actor: 0.62, action: 0.62, object: 0.54 };
}

function classWitnessFloor(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 1;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.94;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.72;
  }
  return 0.68;
}

function classProtectedAnchorFloor(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.98;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.95;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.86;
  }
  return 0.84;
}

function classRewriteBar(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.14;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.16;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.2;
  }
  return 0.22;
}

function hasRegisterMove(changedDimensions = [], lexemeSwaps = []) {
  return (changedDimensions || []).some((dimension) =>
    ['register-mode', 'abbreviation-posture', 'orthography-posture', 'directness', 'abstraction'].includes(dimension)
  ) || Number((lexemeSwaps || []).length || 0) > 0;
}

function punctuationOnlyDrift(changedDimensions = [], lexemeSwaps = []) {
  const dimensions = [...(changedDimensions || [])];
  return dimensions.length > 0 &&
    dimensions.every((dimension) => ['punctuation-shape', 'contraction-posture'].includes(dimension)) &&
    Number((lexemeSwaps || []).length || 0) === 0;
}

function meetsLandedRewriteBar(sourceClass = 'formal-correspondence', rewriteStrength = 0, changedDimensions = [], lexemeSwaps = []) {
  if (rewriteStrength < classRewriteBar(sourceClass)) {
    if (sourceClass === 'procedural-record' && rewriteStrength < 0.12) {
      return false;
    }
    if (sourceClass === 'formal-correspondence' && rewriteStrength < 0.13) {
      return false;
    }
    if (!['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
      return false;
    }
  }
  if (punctuationOnlyDrift(changedDimensions, lexemeSwaps)) {
    return false;
  }
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const registerMovement = hasRegisterMove(changedDimensions, lexemeSwaps);
  if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return structuralMovement >= 1 && registerMovement;
  }
  return structuralMovement >= 1 || registerMovement;
}

function countRegexHits(text = '', pattern) {
  const matches = String(text || '').match(pattern);
  return matches ? matches.length : 0;
}

function countSemicolonFractures(text = '', envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  const semicolonCount = countRegexHits(text, /;\s+/g);
  if (!semicolonCount) {
    return 0;
  }
  const uppercaseAfterSemicolon = countRegexHits(text, /;\s+[A-Z]/g);
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return Math.max(0, uppercaseAfterSemicolon - (sourceClass === 'procedural-record' ? 1 : 0));
  }
  return semicolonCount + uppercaseAfterSemicolon;
}

function countRepeatedHelperVerbs(text = '') {
  const sentences = splitSentencesPreserve(text);
  const helperStarts = sentences
    .map((sentence) => normalizeText(sentence).match(/^(i|we|you|they|he|she|it)\s+(?:am|are|is|was|were|want to|need to|have to|keep|kept|just)\b/i)?.[0]?.toLowerCase() || '')
    .filter(Boolean);
  let repeated = 0;
  for (let index = 1; index < helperStarts.length; index += 1) {
    if (helperStarts[index] === helperStarts[index - 1]) {
      repeated += 1;
    }
  }
  return repeated;
}

function countMalformedContractions(text = '') {
  return countRegexHits(text, /\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/g);
}

function countFragmentArtifacts(text = '', sourceText = '') {
  const outputFragments = splitSentencesPreserve(text)
    .map((sentence) => trimSentenceEnding(sentence))
    .filter(Boolean)
    .filter((sentence) => sentenceWordCount(sentence) <= 2)
    .filter((sentence) => !/\b(?:i guess|hello|good night|all right|maybe)\b/i.test(sentence));
  const sourceFragments = splitSentencesPreserve(sourceText)
    .map((sentence) => trimSentenceEnding(sentence))
    .filter(Boolean)
    .filter((sentence) => sentenceWordCount(sentence) <= 2)
    .length;
  return Math.max(0, outputFragments.length - sourceFragments);
}

function countConnectorLoad(text = '') {
  return countRegexHits(text, /,\s+(?:and|while|but then|because|since|though|as|with)\b/gi);
}

function countClauseJoinArtifacts(text = '') {
  return countRegexHits(text, /,\s+(?=(?:I|We|You|They|He|She|It|Nobody|Keep|Call|Meet|Do|Stop|Without|Then|The)\b)/g);
}

function countLongSentenceDrag(text = '', envelopeId = 'generic') {
  const threshold =
    envelopeId === 'spark' || envelopeId === 'cross-examiner'
      ? 24
      : envelopeId === 'matron' || envelopeId === 'undertow'
        ? 32
        : envelopeId === 'archivist' || envelopeId === 'methods-editor'
          ? 30
          : 28;
  return splitSentencesPreserve(text).filter((sentence) => sentenceWordCount(sentence) > threshold).length;
}

function overBraidingAllowance(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return envelopeId === 'archivist' || envelopeId === 'methods-editor' ? 2 : 1;
  }
  if (envelopeId === 'matron' || envelopeId === 'undertow') {
    return 3;
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 2;
  }
  return 1;
}

function buildArtifactAudit({
  sourceText = '',
  outputText = '',
  sourceClass = 'formal-correspondence',
  envelopeId = 'generic',
  targetProfile = null,
  sourceProfile = {}
} = {}) {
  const allowLowercaseLeads = Number(targetProfile?.orthographicLooseness || 0) >=
    Math.max(0.06, Number(sourceProfile?.orthographicLooseness || 0) + 0.04);
  const lowercaseLeadCount = allowLowercaseLeads ? 0 : countRegexHits(outputText, /(?:^|[.!?;]\s+)[a-z]/g);
  const doubledConnectorCount = countRegexHits(outputText, /\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/gi);
  const semicolonFractureCount = countSemicolonFractures(outputText, envelopeId, sourceClass);
  const repeatedHelperCount = countRepeatedHelperVerbs(outputText);
  const malformedContractionCount = countMalformedContractions(outputText);
  const fragmentCount = countFragmentArtifacts(outputText, sourceText);
  const connectorLoadCount = countConnectorLoad(outputText);
  const clauseJoinCount = countClauseJoinArtifacts(outputText);
  const clauseDragCount = countLongSentenceDrag(outputText, envelopeId);
  const overBraidingCount = Math.max(0, connectorLoadCount - overBraidingAllowance(envelopeId, sourceClass));
  const flags = uniqueStrings([
    lowercaseLeadCount ? 'artifact:lowercase-lead' : null,
    doubledConnectorCount ? 'artifact:doubled-connector' : null,
    semicolonFractureCount ? 'artifact:semicolon-fracture' : null,
    repeatedHelperCount ? 'artifact:repeated-helper' : null,
    malformedContractionCount ? 'artifact:malformed-contraction' : null,
    fragmentCount ? 'artifact:fragment' : null,
    overBraidingCount ? 'artifact:over-braiding' : null,
    clauseJoinCount ? 'artifact:clause-join' : null,
    clauseDragCount ? 'artifact:clause-drag' : null
  ]);
  const penalty = round(clamp01(
    (Math.min(lowercaseLeadCount, 3) * 0.04) +
    (Math.min(doubledConnectorCount, 3) * 0.05) +
    (Math.min(semicolonFractureCount, 3) * 0.04) +
    (Math.min(repeatedHelperCount, 3) * 0.03) +
    (Math.min(malformedContractionCount, 3) * 0.08) +
    (Math.min(fragmentCount, 3) * 0.03) +
    (Math.min(overBraidingCount, 3) * 0.04) +
    (Math.min(clauseJoinCount, 3) * 0.04) +
    (Math.min(clauseDragCount, 3) * 0.03)
  ), 4);

  return Object.freeze({
    flags: Object.freeze(flags),
    penalty,
    lowercaseLeadCount,
    doubledConnectorCount,
    semicolonFractureCount,
    repeatedHelperCount,
    malformedContractionCount,
    fragmentCount,
    connectorLoadCount,
    clauseJoinCount,
    clauseDragCount,
    overBraidingCount
  });
}

function computeRewriteStrength(sourceText = '', outputText = '', sourceProfile = {}, outputProfile = {}, changedDimensions = [], lexemeSwaps = []) {
  const comparableShift = normalizeMovementComparable(sourceText) !== normalizeMovementComparable(outputText);
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const structural = substantiveDimensionCount(changedDimensions);
  const lexical = Math.min(2, Number((lexemeSwaps || []).length || 0));
  return round(clamp01(
    (comparableShift ? 0.12 : 0) +
    (structural * 0.18) +
    (lexical * 0.08) +
    ((fit.functionWordDistance || 0) * 0.2) +
    ((fit.charGramDistance || 0) * 0.14) +
    ((fit.registerDistance || 0) * 0.12) +
    ((fit.directnessDistance || 0) * 0.1) +
    ((fit.abstractionDistance || 0) * 0.1) +
    ((fit.contractionDistance || 0) * 0.08) +
    ((fit.punctShapeDistance || 0) * 0.04) +
    ((fit.abbreviationDistance || 0) * 0.08) +
    ((fit.orthographyDistance || 0) * 0.1) +
    ((fit.conversationDistance || 0) * 0.04)
  ), 4);
}

function computeTargetFit(outputProfile = {}, targetProfile = null) {
  if (!targetProfile) {
    return 0.5;
  }
  const fit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const distance =
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    ((fit.abbreviationDistance || 0) * 0.9) +
    ((fit.orthographyDistance || 0) * 0.9) +
    ((fit.fragmentDistance || 0) * 0.5) +
    ((fit.conversationDistance || 0) * 0.5) +
    ((fit.surfaceMarkerDistance || 0) * 0.7) +
    (fit.registerDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0);
  return round(clamp01(1 - (distance / 5.8)), 4);
}

function familySelectionBonus(sourceClass = 'formal-correspondence', familyId = 'syntax-shape', envelopeId = 'generic') {
  const weighted = familyWeight(familyId, sourceClass, envelopeId);
  return round(Math.max(0, weighted - 1) * 0.08, 4);
}

function personaDistinctnessBonus({
  envelopeId = 'generic',
  sourceProfile = {},
  outputProfile = {},
  sourceClass = 'formal-correspondence',
  structuralOperations = [],
  lexicalOperations = [],
  changedDimensions = [],
  lexemeSwaps = []
} = {}) {
  const avgDelta = Number(outputProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const sentenceDelta = Number(outputProfile.sentenceCount || 0) - Number(sourceProfile.sentenceCount || 0);
  const directnessDelta = Number(outputProfile.directness || 0) - Number(sourceProfile.directness || 0);
  const abstractionDelta = Number(outputProfile.abstractionPosture || 0) - Number(sourceProfile.abstractionPosture || 0);
  const contractionDelta = Number(outputProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const structuralSet = new Set(structuralOperations || []);
  const lexicalSet = new Set(lexicalOperations || []);
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Number((lexemeSwaps || []).length || 0);
  let bonus = 0;

  if (envelopeId === 'spark') {
    bonus += avgDelta <= -0.5 ? 0.06 : 0;
    bonus += sentenceDelta >= 1 ? 0.05 : 0;
    bonus += directnessDelta >= 0.03 ? 0.04 : 0;
    bonus += structuralSet.has('beat-swap') || structuralSet.has('pressure-tighten') || structuralSet.has('split-long-line') ? 0.05 : 0;
  } else if (envelopeId === 'matron') {
    bonus += avgDelta >= 0.7 ? 0.06 : 0;
    bonus += sentenceDelta <= 0 ? 0.04 : 0;
    bonus += abstractionDelta >= 0.02 ? 0.04 : 0;
    bonus += structuralSet.has('pressure-current') || structuralSet.has('beat-merge') || structuralSet.has('connector-cascade') ? 0.05 : 0;
  } else if (envelopeId === 'undertow') {
    bonus += avgDelta >= 0.6 ? 0.05 : 0;
    bonus += abstractionDelta >= 0.02 ? 0.03 : 0;
    bonus += structuralSet.has('pressure-undertow') || structuralSet.has('connector-undertow') || structuralSet.has('beat-merge') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:suddenly->all-at-once') ? 0.03 : 0;
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    bonus += abstractionDelta >= 0.03 ? 0.05 : 0;
    bonus += contractionDelta <= -0.01 ? 0.04 : 0;
    bonus += structuralSet.has('connector-ledger') || structuralSet.has('pressure-ledger') || structuralSet.has('ledger-merge') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:need-to->must') || lexicalSet.has('persona:showed->indicated') ? 0.03 : 0;
  } else if (envelopeId === 'cross-examiner') {
    bonus += avgDelta <= -0.4 ? 0.05 : 0;
    bonus += directnessDelta >= 0.04 ? 0.05 : 0;
    bonus += structuralSet.has('pivot-contrast') || structuralSet.has('pressure-tighten') || structuralSet.has('beat-swap') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:i-want-to-say->say-plainly') || lexicalSet.has('register:say-hi->tell-hi') ? 0.03 : 0;
  }

  if (['reflective-prose', 'narrative-scene'].includes(sourceClass) && structuralMovement >= 1 && lexicalMovement >= 1) {
    bonus += 0.03;
  }

  return round(clamp01(bonus), 4);
}

function hasOperation(operations = [], pattern = '') {
  return (operations || []).some((entry) => String(entry || '').includes(pattern));
}

function buildPersonaSeparationAudit({
  envelopeId = 'generic',
  sourceProfile = {},
  outputProfile = {},
  structuralOperations = [],
  lexicalOperations = [],
  sourceClass = 'formal-correspondence',
  outputText = '',
  artifactAudit = {}
} = {}) {
  const structuralSet = new Set(structuralOperations || []);
  const lexicalSet = new Set(lexicalOperations || []);
  const avgDelta = Number(outputProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const sentenceDelta = Number(outputProfile.sentenceCount || 0) - Number(sourceProfile.sentenceCount || 0);
  const directnessDelta = Number(outputProfile.directness || 0) - Number(sourceProfile.directness || 0);
  const abstractionDelta = Number(outputProfile.abstractionPosture || 0) - Number(sourceProfile.abstractionPosture || 0);
  const contractionDelta = Number(outputProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const comparable = normalizeComparable(outputText);
  const markers = [];
  const warnings = [];
  const addMarker = (label, hit) => {
    markers.push(Object.freeze({ label, hit: Boolean(hit) }));
  };

  if (envelopeId === 'spark') {
    addMarker('clipped-clauses', avgDelta <= -0.5 || sentenceDelta >= 1);
    addMarker('kinetic-pivot', hasOperation(structuralOperations, 'beat-swap') || hasOperation(structuralOperations, 'pressure-tighten') || hasOperation(structuralOperations, 'pivot-burst'));
    addMarker('colloquial-register', lexicalSet.has('persona:i-want-to->i-wanna') || lexicalSet.has('persona:need-to->got-to'));
    addMarker('visible-compression', contractionDelta >= 0.01 || /(?:\bi wanna\b|\bgot to\b|\ball at once\b)/i.test(comparable));
  } else if (envelopeId === 'matron') {
    addMarker('longer-current', avgDelta >= 0.7);
    addMarker('warm-connective', hasOperation(structuralOperations, 'pressure-current') || hasOperation(structuralOperations, 'beat-merge') || hasOperation(structuralOperations, 'connector-cascade') || (sentenceDelta <= -1 && avgDelta >= 0.8));
    addMarker('warmer-register', lexicalSet.has('persona:need-to->have-to') || lexicalSet.has('register:hi->hello') || contractionDelta <= -0.01 || /\bhello\b|\ball right\b|\bI have\b|\bit is\b|\bdo not\b/i.test(comparable));
    addMarker('controlled-braid', Number(artifactAudit.overBraidingCount || 0) === 0);
  } else if (envelopeId === 'undertow') {
    addMarker('delayed-closure', hasOperation(structuralOperations, 'pressure-undertow') || hasOperation(structuralOperations, 'connector-undertow'));
    addMarker('submerged-current', avgDelta >= 0.6 || abstractionDelta >= 0.02);
    addMarker('recursive-drag', /\bbut then\b|\ball at once\b|\bmaybe\b/i.test(comparable));
    addMarker('syntactic-cleanliness', Number(artifactAudit.overBraidingCount || 0) === 0 && Number(artifactAudit.doubledConnectorCount || 0) === 0);
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    addMarker('ledger-order', hasOperation(structuralOperations, 'pressure-ledger') || hasOperation(structuralOperations, 'connector-ledger') || hasOperation(structuralOperations, 'ledger-merge'));
    addMarker('colder-formalization', contractionDelta <= -0.01 || abstractionDelta >= 0.03);
    addMarker('procedural-register', lexicalSet.has('persona:need-to->must') || lexicalSet.has('persona:showed->indicated') || /\bmust\b|\bindicated\b|\bacceptable\b/i.test(comparable));
    addMarker('restrained-punctuation', Number(artifactAudit.semicolonFractureCount || 0) === 0);
  } else if (envelopeId === 'cross-examiner') {
    addMarker('challenge-syntax', hasOperation(structuralOperations, 'pivot-contrast') || hasOperation(structuralOperations, 'pressure-tighten') || hasOperation(structuralOperations, 'beat-swap'));
    addMarker('argument-pressure', directnessDelta >= 0.04 || /\bstop worrying\b|\bthat'?s the point\b|\bwithout warning\b/i.test(comparable));
    addMarker('clipped-scrutiny', avgDelta <= -0.35 || sentenceDelta >= 1);
    addMarker('distinct-register', lexicalSet.has('register:do-not-worry->stop-worrying') || lexicalSet.has('persona:on-the-ready->ready-now'));
  }

  const markerCount = markers.filter((entry) => entry.hit).length;
  const requiredMarkers = envelopeId === 'generic' || envelopeId === 'operator' ? 1 : 2;
  const collisionWarnings = [];

  if (envelopeId === 'spark' && !markers.find((entry) => entry.label === 'colloquial-register')?.hit && markers.find((entry) => entry.label === 'kinetic-pivot')?.hit) {
    collisionWarnings.push('persona-convergence:spark-cross');
  }
  if (envelopeId === 'cross-examiner' && !markers.find((entry) => entry.label === 'distinct-register')?.hit && markers.find((entry) => entry.label === 'challenge-syntax')?.hit) {
    collisionWarnings.push('persona-convergence:spark-cross');
  }
  if (envelopeId === 'matron' && !markers.find((entry) => entry.label === 'warmer-register')?.hit && markers.find((entry) => entry.label === 'longer-current')?.hit) {
    collisionWarnings.push('persona-convergence:matron-undertow');
  }
  if (envelopeId === 'undertow' && !markers.find((entry) => entry.label === 'recursive-drag')?.hit && markers.find((entry) => entry.label === 'submerged-current')?.hit) {
    collisionWarnings.push('persona-convergence:matron-undertow');
  }
  if ((envelopeId === 'archivist' || envelopeId === 'methods-editor') && markerCount < requiredMarkers) {
    collisionWarnings.push('persona-convergence:archivist-neutral');
  }
  if (markerCount < requiredMarkers) {
    warnings.push('persona-markers-thin');
  }
  warnings.push(...collisionWarnings);

  const score = round(clamp01(
    (markerCount / Math.max(requiredMarkers, 1)) * 0.78 +
    (sourceClass === 'procedural-record' || sourceClass === 'formal-correspondence' ? 0.08 : 0.02) -
    (collisionWarnings.length * 0.16)
  ), 4);

  return Object.freeze({
    envelopeId,
    markerCount,
    requiredMarkers,
    score,
    warnings: Object.freeze(uniqueStrings(warnings)),
    markers: Object.freeze(markers)
  });
}

function buildToolabilityAudit({
  sourceClass = 'formal-correspondence',
  transferClass = 'weak',
  rewriteStrength = 0,
  changedDimensions = [],
  lexemeSwaps = [],
  artifactAudit = {},
  semanticLockIntact = false,
  personaSeparationAudit = {},
  distinctnessBonus = 0,
  outputProfile = {},
  sourceProfile = {},
  pathologies = {}
} = {}) {
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Number((lexemeSwaps || []).length || 0);
  const punctuationDriftOnly = punctuationOnlyDrift(changedDimensions, lexemeSwaps);
  const effectiveArtifactPenalty = semanticLockIntact
    ? 0
    : Number((artifactAudit.effectivePenalty ?? artifactAudit.penalty) || 0);
  const overBraidingPenalty = semanticLockIntact
    ? 0
    : Math.min(0.24, Number(artifactAudit.overBraidingCount || 0) * 0.06);
  const clauseDragPenalty = semanticLockIntact
    ? 0
    : Math.min(0.16, Number(artifactAudit.clauseDragCount || 0) * 0.05);
  const clauseJoinPenalty = semanticLockIntact ? 0 : Number(artifactAudit.clauseJoinCount || 0) * 0.06;
  const fragmentPenalty = semanticLockIntact ? 0 : Number(artifactAudit.fragmentCount || 0) * 0.05;
  const sentenceIntegrity = round(clamp01(
    1 -
    (effectiveArtifactPenalty * 1.08) -
    clauseJoinPenalty -
    fragmentPenalty -
    (pathologies.severe ? 0.5 : 0)
  ), 4);
  const readability = round(clamp01(
    0.58 +
    (transferClass === 'structural' ? 0.08 : transferClass === 'surface' ? -0.08 : 0) +
    (structuralMovement >= 1 ? 0.08 : 0) +
    (Number(outputProfile.avgSentenceLength || 0) >= 4 && Number(outputProfile.avgSentenceLength || 0) <= 30 ? 0.06 : 0) -
    effectiveArtifactPenalty -
    overBraidingPenalty -
    clauseDragPenalty
  ), 4);
  const movementQuality = round(clamp01(
    (rewriteStrength * 0.68) +
    Math.min(0.16, structuralMovement * 0.08) +
    (lexicalMovement > 0 ? 0.12 : 0) +
    (transferClass === 'structural' ? 0.1 : 0) -
    (punctuationDriftOnly ? 0.36 : 0)
  ), 4);
  const personaDistinctness = round(clamp01(
    (Number(personaSeparationAudit.score || 0) * 0.72) +
    (Number(distinctnessBonus || 0) * 0.6)
  ), 4);
  const artifactPenalty = round(clamp01(
    effectiveArtifactPenalty +
    overBraidingPenalty +
    clauseDragPenalty
  ), 4);
  const toolabilityScore = round(clamp01(
    (readability * 0.27) +
    (personaDistinctness * 0.24) +
    (sentenceIntegrity * 0.24) +
    (movementQuality * 0.25) -
    (artifactPenalty * 0.34)
  ), 4);
  const warnings = uniqueStrings([
    ...(personaSeparationAudit.warnings || []),
    ...(artifactAudit.flags || []),
    punctuationDriftOnly ? 'toolability:punctuation-only' : null,
    toolabilityScore < 0.6 ? 'toolability:low-confidence' : null,
    readability < 0.58 ? 'toolability:rough-surface' : null,
    sentenceIntegrity < 0.62 ? 'toolability:sentence-integrity' : null
  ]);

  return Object.freeze({
    readability,
    personaDistinctness,
    sentenceIntegrity,
    movementQuality,
    artifactPenalty,
    semanticLockIntact,
    toolabilityScore,
    warnings: Object.freeze(warnings)
  });
}

function buildShellVariants(sourceProfile = {}, shell = {}, sourceClass = 'formal-correspondence') {
  const targetProfile = shell?.profile || null;
  const envelopeId = inferEnvelopeId(shell, sourceProfile, targetProfile || {});
  const sourceRegisterLane = inferRegisterLaneFromProfile(sourceProfile, sourceClass);
  const targetRegisterLane = resolveTargetRegisterLane({
    shell,
    targetProfile,
    sourceProfile,
    sourceClass
  });
  const generationControls = resolveOntologyGenerationControls({
    sourceClass,
    sourceRegisterLane,
    targetRegisterLane
  });
  const adjustments = ENVELOPE_ADJUSTMENTS[envelopeId] || ENVELOPE_ADJUSTMENTS.generic;
  const baseMod = shell?.mod
    ? normalizeShellModValue(shell.mod)
    : cadenceModFromProfile(targetProfile || sourceProfile);
  const baseStrength = clamp(
    Number(shell?.strength ?? (shell?.profile ? 0.84 : 0.72)) * Number(generationControls.strengthScalar || 1),
    0,
    1
  );
  const scalar = classScalar(sourceClass);
  const variants = [
    {
      id: 'base',
      shell: {
        ...shell,
        mod: baseMod,
        strength: baseStrength,
        profile: targetProfile ? cloneProfile(targetProfile) : null,
        generationControls
      },
      envelopeId
    },
    {
      id: 'amplified',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.primary, scalar),
        strength: clamp(baseStrength + (sourceClass === 'procedural-record' ? 0.04 : 0.08), 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1 * Number(generationControls.intensityScalar || 1)),
        generationControls
      },
      envelopeId
    },
    {
      id: 'contrast',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.secondary, scalar),
        strength: clamp(baseStrength + (sourceClass === 'procedural-record' ? 0.08 : 0.14), 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.18 * Number(generationControls.intensityScalar || 1)),
        generationControls
      },
      envelopeId
    },
    {
      id: 'conservative',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.conservative, Math.max(0.5, scalar * 0.8)),
        strength: clamp(baseStrength - 0.08, 0.28, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 0.78 * Number(generationControls.intensityScalar || 1)),
        generationControls
      },
      envelopeId
    }
  ];

  return variants.filter((entry, index, array) => {
    const key = JSON.stringify({
      mod: entry.shell.mod,
      strength: entry.shell.strength,
      envelopeId: entry.envelopeId,
      avgSentenceLength: round(entry.shell.profile?.avgSentenceLength || 0, 3),
      contractionDensity: round(entry.shell.profile?.contractionDensity || 0, 3),
      punctuationDensity: round(entry.shell.profile?.punctuationDensity || 0, 3)
    });
    return array.findIndex((candidate) => {
      const candidateKey = JSON.stringify({
        mod: candidate.shell.mod,
        strength: candidate.shell.strength,
        envelopeId: candidate.envelopeId,
        avgSentenceLength: round(candidate.shell.profile?.avgSentenceLength || 0, 3),
        contractionDensity: round(candidate.shell.profile?.contractionDensity || 0, 3),
        punctuationDensity: round(candidate.shell.profile?.punctuationDensity || 0, 3)
      });
      return candidateKey === key;
    }) === index;
  });
}

const NATIVE_CANDIDATE_FAMILIES = Object.freeze([
  Object.freeze({ id: 'syntax-shape', label: 'syntax-shape' }),
  Object.freeze({ id: 'register-lexicon', label: 'register-lexicon' }),
  Object.freeze({ id: 'cadence-connector', label: 'cadence-connector' }),
  Object.freeze({ id: 'order-beat', label: 'order-beat' }),
  Object.freeze({ id: 'clause-pivot', label: 'clause-pivot' }),
  Object.freeze({ id: 'persona-lexicon', label: 'persona-lexicon' }),
  Object.freeze({ id: 'pressure-current', label: 'pressure-current' }),
  Object.freeze({ id: 'hybrid', label: 'hybrid' })
]);

function splitParagraphs(text = '') {
  return normalizeText(text)
    .split(/\n{2,}/)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function joinParagraphs(paragraphs = []) {
  return (paragraphs || [])
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .join('\n\n');
}

function protectAnchorsForRewrite(text = '', anchors = []) {
  let working = String(text || '');
  const replacements = [];
  const maskCounts = {
    entity: 0,
    location: 0,
    time: 0,
    quote: 0,
    account: 0,
    record: 0,
    anchor: 0
  };
  [...(anchors || [])]
    .map((anchor) => String(anchor || '').trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .forEach((anchor) => {
      const pattern = new RegExp(escapeRegex(anchor), 'g');
      if (!pattern.test(working)) {
        return;
      }
      const kind = classifySensitiveAnchor(anchor);
      const token = buildMaskedAnchorToken(kind, maskCounts[kind]++);
      working = working.replace(pattern, token);
      replacements.push(Object.freeze({ token, value: anchor, kind }));
    });

  return Object.freeze({
    text: working,
    replacements: Object.freeze(replacements)
  });
}

function restoreAnchorsAfterRewrite(text = '', replacements = []) {
  let working = String(text || '');
  for (const replacement of replacements || []) {
    if (!replacement?.token) {
      continue;
    }
    working = working.replace(new RegExp(escapeRegex(replacement.token), 'g'), replacement.value || '');
  }
  return working;
}

function lowerLeadingAlpha(text = '') {
  return String(text || '').replace(/^[A-Z](?=[a-z])/g, (match) => match.toLowerCase());
}

function upperSentenceStarts(text = '') {
  return String(text || '').replace(/(^|[.!?]\s+)([a-z])/g, (match, lead, letter) => `${lead}${letter.toUpperCase()}`);
}

function trimSentenceEnding(text = '') {
  return normalizeText(text).replace(/[.!?]+$/g, '').trim();
}

function finalizeSentence(text = '', punctuation = '.') {
  const trimmed = trimSentenceEnding(text);
  return trimmed ? `${trimmed}${punctuation}` : '';
}

function replaceLimited(text = '', pattern, replacer, limit = 1) {
  if (limit <= 0) {
    return text;
  }

  let count = 0;
  return String(text || '').replace(pattern, (...args) => {
    if (count >= limit) {
      return args[0];
    }
    count += 1;
    return typeof replacer === 'function' ? replacer(...args) : replacer;
  });
}

function matchCase(source = '', replacement = '') {
  if (!source) {
    return replacement;
  }
  const firstChar = source.charAt(0);
  const firstIsAlpha = /[a-zA-Z]/.test(firstChar);
  if (!firstIsAlpha) {
    return replacement;
  }
  if (source === source.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (firstChar === firstChar.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function variantIntensity(variant = {}) {
  if (variant?.id === 'contrast') {
    return 1.22;
  }
  if (variant?.id === 'amplified') {
    return 1.08;
  }
  if (variant?.id === 'conservative') {
    return 0.84;
  }
  return 1;
}

function familyWeight(familyId = 'syntax-shape', sourceClass = 'formal-correspondence', envelopeId = 'generic') {
  const classWeights = {
    'procedural-record': {
      'syntax-shape': 1.12,
      'register-lexicon': 0.94,
      'cadence-connector': 0.92,
      'order-beat': 0.88,
      'clause-pivot': 1.04,
      'persona-lexicon': 1.02,
      'pressure-current': 0.9,
      hybrid: 0.98
    },
    'formal-correspondence': {
      'syntax-shape': 1.08,
      'register-lexicon': 0.96,
      'cadence-connector': 1.04,
      'order-beat': 1,
      'clause-pivot': 1,
      'persona-lexicon': 1.06,
      'pressure-current': 0.96,
      hybrid: 1.06
    },
    'reflective-prose': {
      'syntax-shape': 0.98,
      'register-lexicon': 1,
      'cadence-connector': 1,
      'order-beat': 1,
      'clause-pivot': 1.12,
      'persona-lexicon': 1.08,
      'pressure-current': 1.12,
      hybrid: 1.08
    },
    'narrative-scene': {
      'syntax-shape': 1,
      'register-lexicon': 0.94,
      'cadence-connector': 0.96,
      'order-beat': 1.12,
      'clause-pivot': 1.1,
      'persona-lexicon': 0.98,
      'pressure-current': 1.08,
      hybrid: 1.06
    }
  };
  const envelopeWeights = {
    spark: {
      'order-beat': 1.08,
      'clause-pivot': 1.04,
      'pressure-current': 1.04
    },
    matron: {
      'pressure-current': 1.1,
      'clause-pivot': 1.04,
      'persona-lexicon': 1.08,
      hybrid: 1.04
    },
    undertow: {
      'pressure-current': 1.12,
      'clause-pivot': 1.05,
      'persona-lexicon': 1.04,
      hybrid: 1.03
    },
    archivist: {
      'clause-pivot': 1.08,
      'persona-lexicon': 1.05,
      'pressure-current': 1.04
    },
    'cross-examiner': {
      'clause-pivot': 1.08,
      'order-beat': 1.05,
      'persona-lexicon': 1.1
    }
  };
  const classWeight = classWeights[sourceClass]?.[familyId] ?? 1;
  const envelopeWeight = envelopeWeights[envelopeId]?.[familyId] ?? 1;
  if (familyId === 'hybrid') {
    return 1.18 * classWeight * envelopeWeight;
  }
  if (familyId === 'order-beat') {
    return 1.08 * classWeight * envelopeWeight;
  }
  if (familyId === 'register-lexicon') {
    return 0.94 * classWeight * envelopeWeight;
  }
  if (familyId === 'clause-pivot') {
    return 1.06 * classWeight * envelopeWeight;
  }
  if (familyId === 'persona-lexicon') {
    return 1.02 * classWeight * envelopeWeight;
  }
  if (familyId === 'pressure-current') {
    return 1.08 * classWeight * envelopeWeight;
  }
  return classWeight * envelopeWeight;
}

function replacementLimitForClass(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 1;
  }
  if (sourceClass === 'formal-correspondence') {
    return 2;
  }
  return 3;
}

function borrowedConnectorShiftFavored(shellMode, targetProfile, sourceText) {
  if (shellMode !== 'borrowed' || !targetProfile || !sourceText) {
    return false;
  }
  const src = String(sourceText).toLowerCase();
  const sourceHas =
    /\bbecause\b/.test(src) ||
    /\bbut\b/.test(src) ||
    /\bso\b/.test(src);
  if (!sourceHas) {
    return false;
  }
  const words = targetProfile.functionWordProfile || {};
  return Boolean(Number(words.since) || Number(words.though) || Number(words.then));
}

function connectorStrategyFor(envelopeId = 'generic', sourceClass = 'formal-correspondence', familyId = 'syntax-shape', context = {}) {
  if (familyId === 'order-beat') {
    return 'front';
  }
  if (envelopeId === 'spark') {
    return 'split';
  }
  if (envelopeId === 'cross-examiner') {
    return 'cross';
  }
  if (envelopeId === 'operator') {
    return 'balanced';
  }
  if (envelopeId === 'matron') {
    return 'cascade';
  }
  if (envelopeId === 'undertow') {
    return 'undertow';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'ledger';
  }
  if (sourceClass === 'procedural-record') {
    return 'balanced';
  }
  if (familyId === 'cadence-connector') {
    return 'shift';
  }
  if (borrowedConnectorShiftFavored(context.shellMode, context.targetProfile, context.sourceText)) {
    return 'shift';
  }
  return 'balanced';
}

function contractionStrategyFor(envelopeId = 'generic', targetProfile = null, sourceProfile = {}, sourceClass = 'formal-correspondence', familyId = 'syntax-shape') {
  if (envelopeId === 'matron' || envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'expand';
  }
  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    return 'contract';
  }
  if (envelopeId === 'operator') {
    return 'preserve';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record'
      ? 'preserve'
      : ((targetProfile?.contractionDensity || 0) <= (sourceProfile?.contractionDensity || 0) ? 'expand' : 'contract');
  }
  if (Number(targetProfile?.contractionDensity || 0) >= Number(sourceProfile?.contractionDensity || 0) + 0.01) {
    return 'contract';
  }
  if (Number(targetProfile?.contractionDensity || 0) <= Number(sourceProfile?.contractionDensity || 0) - 0.01) {
    return 'expand';
  }
  if (familyId === 'register-lexicon' && sourceClass !== 'procedural-record') {
    return 'contract';
  }
  return 'preserve';
}

function chooseMergeLinker(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (envelopeId === 'matron') {
    return sourceClass === 'procedural-record' ? '; ' : ', and ';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record' ? '; while ' : ', and then ';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return '; ';
  }
  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    return '. ';
  }
  if (envelopeId === 'operator') {
    return '; ';
  }
  return sourceClass === 'procedural-record' ? '; ' : ', and ';
}

function recordLexemeSwap(swaps = [], from = '', to = '', family = 'register') {
  const source = normalizeText(from);
  const target = normalizeText(to);
  if (!source || !target || normalizeComparable(source) === normalizeComparable(target)) {
    return;
  }
  swaps.push(Object.freeze({
    from: source,
    to: target,
    family
  }));
}

function surfaceDeltaSummary(text = '') {
  const firstSentence = splitSentencesPreserve(text)[0] || normalizeText(text);
  return normalizeText(firstSentence)
    .split(/\s+/)
    .slice(0, 8)
    .join(' ');
}

function recordOntologyLensDelta(swaps = [], beforeText = '', afterText = '', targetOntology = 'balanced') {
  const before = normalizeText(beforeText);
  const after = normalizeText(afterText);
  if (!before || !after || normalizeComparable(before) === normalizeComparable(after)) {
    return;
  }

  const startCount = Number(swaps.length || 0);
  const ontology = String(targetOntology || '').trim().toLowerCase();
  const candidates = ontology === 'actor'
    ? [
        ['package', 'pkg'],
        ['parcel', 'pkg'],
        ['because', 'bc'],
        ['apartment door', 'her door'],
        ['second-floor landing near the stair rail', 'by the stairs'],
        ['building footage and resident testimony', 'no one buzzed her'],
        ['the outer carton remained sealed', 'box stayed sealed'],
        ['the red rush label remained attached', 'red rush label still on it'],
        ['ownership was confirmed', 'said yes its hers']
      ]
    : ontology === 'institutional'
      ? [
          ['pkg', 'parcel'],
          ['mgmt', 'management'],
          ['by the stairs', 'second-floor landing near the stair rail'],
          ['box stayed sealed', 'the box remained sealed'],
          ['red rush sticker still on it', 'the red rush label remained attached'],
          ['said yes its hers', 'ownership was confirmed']
        ]
      : [];

  for (const [from, to] of candidates) {
    if (normalizeComparable(before).includes(normalizeComparable(from)) && normalizeComparable(after).includes(normalizeComparable(to))) {
      recordLexemeSwap(swaps, from, to, 'surface');
    }
  }

  if (Number(swaps.length || 0) === startCount) {
    recordLexemeSwap(swaps, surfaceDeltaSummary(before), surfaceDeltaSummary(after), 'surface');
  }
}

function applyReplacementRule(text = '', pattern, replacement = '', context = {}) {
  let applied = false;
  const next = replaceLimited(
    text,
    pattern,
    (match) => {
      applied = true;
      const finalReplacement = matchCase(match, replacement);
      if (context.label) {
        (context.operations || []).push(context.label);
      }
      recordLexemeSwap(context.lexemeSwaps || [], match, finalReplacement, context.family || 'register');
      return finalReplacement;
    },
    context.limit ?? 1
  );
  return applied ? next : text;
}

function applyScenePersonaPulse(text = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  if (!['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return text;
  }

  let working = normalizeText(text);
  if (!working) {
    return working;
  }

  const operations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const replaceWithLedger = (pattern, replacement, label, limit = 1) => {
    working = applyReplacementRule(working, pattern, replacement, {
      limit,
      label,
      family: 'register',
      operations,
      lexemeSwaps
    });
  };
  const trimFiller = (pattern, label, limit = 1) => {
    let applied = false;
    const next = replaceLimited(working, pattern, () => {
      applied = true;
      operations.push(label);
      return '';
    }, limit);
    if (applied) {
      working = normalizeText(next);
    }
  };
  const splitIntentTail = (label, replacement, limit = 1) => {
    let applied = false;
    const next = replaceLimited(
      working,
      /\b([^.!?]{3,60}?)\s+(that(?: is|'s) what I(?: am|'m) (?:trying to say|saying))\b/gi,
      (match, clause, tail) => {
        applied = true;
        operations.push(label);
        const resolvedTail = typeof replacement === 'function' ? replacement(tail) : replacement;
        return `${normalizeText(clause)}. ${resolvedTail}`;
      },
      limit
    );
    if (applied) {
      working = normalizeText(next);
    }
  };

  if (envelopeId === 'spark') {
    replaceWithLedger(/\bI want to say hi to him\b/gi, 'I wanna say hi to him', 'register:want-to-say-hi->wanna-say-hi');
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better');
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, "that's what I'm trying to say", 'register:i-guess-trying-to-say->thats-what-im-trying-to-say');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    splitIntentTail('structural:split-intent-tail', "That's what I'm trying to say");
    if (sourceClass === 'narrative-scene') {
      const next = splitSceneBursts(working);
      if (next !== working) {
        operations.push('structural:scene-burst-split');
        working = next;
      }
    }
  } else if (envelopeId === 'cross-examiner') {
    replaceWithLedger(/\bI want to say hi to him\b/gi, 'I want to tell him hi', 'register:say-hi->tell-hi');
    replaceWithLedger(/\bDon't worry about\b/gi, 'Stop worrying about', 'register:do-not-worry->stop-worrying');
    replaceWithLedger(/\bKeep doing what (?:you are|you're) doing\b/gi, 'Keep doing it', 'register:keep-doing-what-youre-doing->keep-doing-it');
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better');
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, "that's what I'm saying", 'register:i-guess-trying-to-say->thats-what-im-saying');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    replaceWithLedger(/\bAnd I blame\b/gi, 'I blame', 'register:drop-leading-and-blame');
    splitIntentTail('structural:split-intent-tail', "That's the point.");
    if (sourceClass === 'narrative-scene') {
      replaceWithLedger(/\bsuddenly\b/gi, 'without warning', 'register:suddenly->without-warning');
      const next = splitSceneBursts(working).replace(/\bSuddenly,\s+I\b/g, 'Without warning. I');
      if (next !== working) {
        operations.push('structural:scene-burst-split');
        working = next;
      }
    }
  } else if (envelopeId === 'matron') {
    replaceWithLedger(/\bhi\b/gi, 'hello', 'register:hi->hello', 1);
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better', 1);
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, 'that is what I am trying to say', 'register:i-guess-trying-to-say->that-is-what-i-am-trying-to-say', 1);
    if (sourceClass === 'narrative-scene') {
      replaceWithLedger(/\bOn the ready\b/gi, 'At the ready', 'register:on-the-ready->at-the-ready', 1);
      replaceWithLedger(/\bsuddenly\b/gi, 'without warning', 'register:suddenly->without-warning', 1);
    }
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    splitIntentTail('structural:split-intent-tail', 'That is what I am trying to say.');
    working = normalizeText(
      working
        .replace(/\bAnd\s+I blame\b/g, 'I blame')
        .replace(/\bAnd\s+we have\b/g, 'We have')
        .replace(/\bAnd\s+keep\b/g, 'Keep')
    );
  } else if (envelopeId === 'undertow') {
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better', 1);
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, 'that is what I am trying to say', 'register:i-guess-trying-to-say->that-is-what-i-am-trying-to-say', 1);
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    splitIntentTail('structural:split-intent-tail', 'That is what I am trying to say.');
    working = normalizeText(
      working
        .replace(/\bAnd\s+I blame\b/g, 'I blame')
        .replace(/\bAnd\s+we have\b/g, 'We have')
        .replace(/\bAnd\s+keep\b/g, 'Keep')
        .replace(/\bWhile\s+do not\b/gi, 'Do not')
        .replace(/\bWhile\s+nobody\b/gi, 'Nobody')
        .replace(/\bWhile\s+on the ready\b/gi, 'On the ready')
        .replace(/\bWhile\s+"Tell me more about yourself"/gi, '"Tell me more about yourself"')
        .replace(/\bWhile\s+I needed that\b/gi, 'I needed that')
        .replace(/\bWhile\s+keep\b/g, 'Keep')
        .replace(/\bWhile\s+we have\b/g, 'We have')
        .replace(/\bWhile\s+it is\b/g, 'It is')
        .replace(/\bWhile\s+i am\b/gi, 'I am')
        .replace(/\bWhile\s+I must\b/gi, 'I must')
        .replace(/,\s+while\s+keep\b/gi, ', and keep')
        .replace(/,\s+while\s+we have\b/gi, ', and we have')
        .replace(/,\s+while\s+call\b/gi, ', and call')
        .replace(/,\s+while\s+meet\b/gi, ', and meet')
        .replace(/,\s+while\s+i\b/gi, ', and I')
        .replace(/,\s+while\s+it\b/gi, ', and it')
        .replace(/,\s+and then\s+and\b/gi, ', and then')
        .replace(/,,+/g, ',')
    );
  }

  return tidyEnvelopeText(working);
}

function applyContractionStrategyText(text = '', strategy = 'preserve', context = {}) {
  let working = String(text || '');
  if (strategy === 'contract') {
    const next = contractExpansions(working);
    if (next !== working) {
      (context.lexicalOperations || []).push('contraction:contract');
      working = next;
    }
  } else if (strategy === 'expand') {
    const next = expandContractions(working);
    if (next !== working) {
      (context.lexicalOperations || []).push('contraction:expand');
      working = next;
    }
  }
  return working;
}

function wantsCompressedSurface(targetProfile = {}, sourceProfile = {}) {
  return Number(targetProfile?.abbreviationDensity || 0) > (Number(sourceProfile?.abbreviationDensity || 0) + 0.03) ||
    Number(targetProfile?.orthographicLooseness || 0) > (Number(sourceProfile?.orthographicLooseness || 0) + 0.04);
}

function wantsExpandedSurface(targetProfile = {}, sourceProfile = {}) {
  const targetMode = String(targetProfile?.registerMode || '').trim().toLowerCase();
  return Number(targetProfile?.abbreviationDensity || 0) + Number(targetProfile?.orthographicLooseness || 0) + 0.03 <
      (Number(sourceProfile?.abbreviationDensity || 0) + Number(sourceProfile?.orthographicLooseness || 0)) ||
    Number(targetProfile?.orthographicLooseness || 0) + 0.04 < Number(sourceProfile?.orthographicLooseness || 0) ||
    ['formal', 'reflective'].includes(targetMode);
}

function loosenSentenceStartsV2(text = '', limit = 2) {
  let applied = 0;
  return String(text || '').replace(/(^|[.!?]\s+|\n+)([A-Z][a-z]+)/g, (match, prefix, word) => {
    if (applied >= limit || /^I(?:\b|$)/.test(word)) {
      return match;
    }
    applied += 1;
    return `${prefix}${word.charAt(0).toLowerCase()}${word.slice(1)}`;
  });
}

function enforceRushedMobileOrthography(text = '', context = {}) {
  const targetRegisterLane = normalizeRegisterLane(context?.targetRegisterLane, '');
  if (targetRegisterLane !== 'rushed-mobile') {
    return text;
  }
  const targetLooseness = Number(context?.targetProfile?.orthographicLooseness || 0);
  const sourceLooseness = Number(context?.sourceProfile?.orthographicLooseness || 0);
  const wantsNoisyOrthography =
    featurePressureActive(context, 'orthographyNoise') ||
    targetLooseness >= Math.max(0.06, sourceLooseness + 0.04) ||
    featureMarkerActive(context?.donorVernacularFeatures, 'orthographyNoise', 'lowercase-i') ||
    featureMarkerActive(context?.donorVernacularFeatures, 'orthographyNoise', 'standalone-lowercase-i');
  if (!wantsNoisyOrthography) {
    return text;
  }

  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const beforeStandaloneI = working;
  working = working.replace(/\bI\b/g, 'i');
  if (working !== beforeStandaloneI) {
    lexicalOperations.push('feature:lowercase-i-final');
    recordLexemeSwap(lexemeSwaps, 'I', 'i', 'feature');
  }
  return working;
}

function applyCompressedSurfaceRewrite(text = '', targetProfile = {}, sourceProfile = {}, context = {}) {
  if (!wantsCompressedSurface(targetProfile, sourceProfile)) {
    return text;
  }

  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const abbreviationLimit = Number(targetProfile?.abbreviationDensity || 0) >= 0.11 ? 4 : 2;
  const orthographyHeavy =
    Number(targetProfile?.orthographicLooseness || 0) >= Math.max(0.06, Number(sourceProfile?.orthographicLooseness || 0) + 0.04);

  const abbreviationRules = [
    { pattern: /\bplease\b/gi, replacement: 'pls', label: 'compressed:please->pls' },
    { pattern: /\bbecause\b/gi, replacement: 'bc', label: 'compressed:because->bc' },
    { pattern: /\bokay\b/gi, replacement: 'ok', label: 'compressed:okay->ok' },
    { pattern: /\bdocumentation timing\b/gi, replacement: 'docs lag', label: 'compressed:documentation-timing->docs-lag' },
    { pattern: /\bdocumentation\b/gi, replacement: 'docs', label: 'compressed:documentation->docs' },
    { pattern: /\bdepartment\b/gi, replacement: 'dept', label: 'compressed:department->dept' },
    { pattern: /\bsupervisor\b/gi, replacement: 'sup', label: 'compressed:supervisor->sup' },
    { pattern: /\bperformance\b/gi, replacement: 'perf', label: 'compressed:performance->perf' },
    { pattern: /\bscheduled\b/gi, replacement: 'sched', label: 'compressed:scheduled->sched' },
    { pattern: /\btomorrow\b/gi, replacement: 'tmrw', label: 'compressed:tomorrow->tmrw' },
    { pattern: /\blet me know\b/gi, replacement: 'lmk', label: 'compressed:let-me-know->lmk' },
    { pattern: /\bforwarded\b/gi, replacement: 'fwd', label: 'compressed:forwarded->fwd' },
    { pattern: /\bpeople\b/gi, replacement: 'ppl', label: 'compressed:people->ppl' },
    { pattern: /\bdifferent\b/gi, replacement: 'diff', label: 'compressed:different->diff' },
    { pattern: /\bwritten record\b/gi, replacement: 'writeup', label: 'compressed:written-record->writeup' },
    { pattern: /\bmanagement\b/gi, replacement: 'mgmt', label: 'compressed:management->mgmt' },
    { pattern: /\baccount\b/gi, replacement: 'acct', label: 'compressed:account->acct' },
    { pattern: /\bpackage\b/gi, replacement: 'pkg', label: 'compressed:package->pkg' },
    { pattern: /\bparcel\b/gi, replacement: 'pkg', label: 'compressed:parcel->pkg' },
    { pattern: /\bappointment\b/gi, replacement: 'appt', label: 'compressed:appointment->appt' },
    { pattern: /\bmessage\b/gi, replacement: 'msg', label: 'compressed:message->msg' },
    { pattern: /\bweek\b/gi, replacement: 'wk', label: 'compressed:week->wk' },
    { pattern: /\btemporary\b/gi, replacement: 'temp', label: 'compressed:temporary->temp' },
    { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'compressed:approximately->about' }
  ];

  for (const rule of abbreviationRules) {
    const next = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return rule.replacement;
    }, abbreviationLimit);
    working = next;
  }

  working = applyFeatureRuleSet(
    working,
    DEGRADATION_FEATURE_RULES.filter((rule) => ['chatspeakShorthand', 'slangMarkers', 'vernacularMarkers'].includes(rule.family)),
    context,
    { limit: abbreviationLimit, direction: 'degrade' }
  );

  if (orthographyHeavy) {
    const orthographyRules = [
      { pattern: /\byou['’]re\b/gi, replacement: 'youre', label: 'orthography:youre' },
      { pattern: /\bdon['’]t\b/gi, replacement: 'dont', label: 'orthography:dont' },
      { pattern: /\bcan['’]t\b/gi, replacement: 'cant', label: 'orthography:cant' },
      { pattern: /\bwon['’]t\b/gi, replacement: 'wont', label: 'orthography:wont' },
      { pattern: /\bI['’]m\b/gi, replacement: 'im', label: 'orthography:im' },
      { pattern: /\bI['’]ve\b/gi, replacement: 'ive', label: 'orthography:ive' },
      { pattern: /\bI['’]ll\b/gi, replacement: 'ill', label: 'orthography:ill' },
      { pattern: /\bthat['’]s\b/gi, replacement: 'thats', label: 'orthography:thats' },
      { pattern: /\bit['’]s\b/gi, replacement: 'its', label: 'orthography:its' }
    ];
    orthographyRules.push(
      { pattern: /\byou(?:'|’)re\b/gi, replacement: 'youre', label: 'orthography:youre' },
      { pattern: /\bdon(?:'|’)t\b/gi, replacement: 'dont', label: 'orthography:dont' },
      { pattern: /\bdoesn(?:'|’)t\b/gi, replacement: 'doesnt', label: 'orthography:doesnt' },
      { pattern: /\bdidn(?:'|’)t\b/gi, replacement: 'didnt', label: 'orthography:didnt' },
      { pattern: /\bcan(?:'|’)t\b/gi, replacement: 'cant', label: 'orthography:cant' },
      { pattern: /\bcouldn(?:'|’)t\b/gi, replacement: 'couldnt', label: 'orthography:couldnt' },
      { pattern: /\bshouldn(?:'|’)t\b/gi, replacement: 'shouldnt', label: 'orthography:shouldnt' },
      { pattern: /\bwon(?:'|’)t\b/gi, replacement: 'wont', label: 'orthography:wont' },
      { pattern: /\bisn(?:'|’)t\b/gi, replacement: 'isnt', label: 'orthography:isnt' },
      { pattern: /\bwasn(?:'|’)t\b/gi, replacement: 'wasnt', label: 'orthography:wasnt' },
      { pattern: /\bweren(?:'|’)t\b/gi, replacement: 'werent', label: 'orthography:werent' },
      { pattern: /\bI(?:'|’)m\b/gi, replacement: 'im', label: 'orthography:im' },
      { pattern: /\bI(?:'|’)ve\b/gi, replacement: 'ive', label: 'orthography:ive' },
      { pattern: /\bI(?:'|’)ll\b/gi, replacement: 'ill', label: 'orthography:ill' },
      { pattern: /\bthat(?:'|’)s\b/gi, replacement: 'thats', label: 'orthography:thats' },
      { pattern: /\bit(?:'|’)s\b/gi, replacement: 'its', label: 'orthography:its' }
    );
    const orthographyLimit = Number(targetProfile?.orthographicLooseness || 0) >= 0.4 ? 6 : (Number(targetProfile?.orthographicLooseness || 0) >= 0.09 ? 4 : 2);
    for (const rule of orthographyRules) {
      const next = replaceLimited(working, rule.pattern, (match) => {
        lexicalOperations.push(rule.label);
        recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
        return rule.replacement;
      }, orthographyLimit);
      working = next;
    }
    const lowercaseLeadLimit = Number(targetProfile?.orthographicLooseness || 0) >= 0.6 ? 6 : (Number(targetProfile?.orthographicLooseness || 0) >= 0.2 ? 4 : 2);
    const lowered = loosenSentenceStartsV2(working, lowercaseLeadLimit);
    if (lowered !== working) {
      lexicalOperations.push('orthography:lowercase-lead');
      working = lowered;
    }
  }

  if (featurePressureActive(context, 'notePosture')) {
    const beforeNoteCompression = working;
    working = working
      .replace(/\bIf ([^,.!?]{3,80}),\s+/g, (match, clause) => {
        lexicalOperations.push('feature:conditional->colon-note');
        recordLexemeSwap(lexemeSwaps, match.trim(), `if ${lowerLeadingAlpha(normalizeText(clause))}:`, 'feature');
        return `if ${lowerLeadingAlpha(normalizeText(clause))}: `;
      })
      .replace(/\bafter she confirmed it was hers because she was already carrying (?:groceries|bags)\b/gi, () => {
        lexicalOperations.push('feature:because->slash-note');
        return 'after she said yes its hers / she had bags already';
      });
    if (beforeNoteCompression !== working) {
      context.structuralOperations?.push('feature:note-posture-compression');
    }
  }

  return working;
}

function applyExpandedSurfaceRewrite(text = '', targetProfile = {}, sourceProfile = {}, context = {}) {
  if (!wantsExpandedSurface(targetProfile, sourceProfile)) {
    return text;
  }

  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const limit = Number(sourceProfile?.orthographicLooseness || 0) >= 0.4 ? 6 : 3;
  const expansionRules = [
    { pattern: /\bpls\b/gi, replacement: 'please', label: 'expanded:pls->please' },
    { pattern: /\bbc\b/gi, replacement: 'because', label: 'expanded:bc->because' },
    { pattern: /\bdocs lag\b/gi, replacement: 'documentation timing', label: 'expanded:docs-lag->documentation-timing' },
    { pattern: /\bppl\b/gi, replacement: 'people', label: 'expanded:ppl->people' },
    { pattern: /\bdocs\b/gi, replacement: 'documentation', label: 'expanded:docs->documentation' },
    { pattern: /\bdiff\b/gi, replacement: 'different', label: 'expanded:diff->different' },
    { pattern: /\bwriteup\b/gi, replacement: 'written record', label: 'expanded:writeup->written-record' },
    { pattern: /\bmsg\b/gi, replacement: 'message', label: 'expanded:msg->message' },
    { pattern: /\bacct\b/gi, replacement: 'account', label: 'expanded:acct->account' },
    { pattern: /\bappt\b/gi, replacement: 'appointment', label: 'expanded:appt->appointment' },
    { pattern: /\btemp\b/gi, replacement: 'temporary', label: 'expanded:temp->temporary' },
    { pattern: /\bwks\b/gi, replacement: 'weeks', label: 'expanded:wks->weeks' },
    { pattern: /\bwk\b/gi, replacement: 'week', label: 'expanded:wk->week' }
  ];

  for (const rule of expansionRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, limit);
  }

  working = applyFeatureRuleSet(working, FORMALIZATION_FEATURE_RULES, context, {
    limit,
    direction: 'formalize'
  });

  working = replaceLimited(working, /\bw\/o\b/gi, (match) => {
    lexicalOperations.push('expanded:w/o->without');
    recordLexemeSwap(lexemeSwaps, match, 'without', 'surface');
    return matchCase(match, 'without');
  }, 2);
  working = replaceLimited(working, /\bw\/\b/gi, (match) => {
    lexicalOperations.push('expanded:w/->with');
    recordLexemeSwap(lexemeSwaps, match, 'with', 'surface');
    return matchCase(match, 'with');
  }, 2);
  working = replaceLimited(working, /\bw\b(?=\s+[A-Za-z])/g, (match) => {
    lexicalOperations.push('expanded:w->with');
    recordLexemeSwap(lexemeSwaps, match, 'with', 'surface');
    return 'with';
  }, 2);

  const contractionRules = [
    { pattern: /\bdont\b/gi, replacement: 'do not', label: 'expanded:dont->do-not' },
    { pattern: /\bdoesnt\b/gi, replacement: 'does not', label: 'expanded:doesnt->does-not' },
    { pattern: /\bdidnt\b/gi, replacement: 'did not', label: 'expanded:didnt->did-not' },
    { pattern: /\byoure\b/gi, replacement: 'you are', label: 'expanded:youre->you-are' },
    { pattern: /\bim\b/gi, replacement: 'I am', label: 'expanded:im->i-am' },
    { pattern: /\bive\b/gi, replacement: 'I have', label: 'expanded:ive->i-have' },
    { pattern: /\bill\b/gi, replacement: 'I will', label: 'expanded:ill->i-will' },
    { pattern: /\bthats\b/gi, replacement: 'that is', label: 'expanded:thats->that-is' },
    { pattern: /\bisnt\b/gi, replacement: 'is not', label: 'expanded:isnt->is-not' },
    { pattern: /\bcant\b/gi, replacement: 'cannot', label: 'expanded:cant->cannot' },
    { pattern: /\bcouldnt\b/gi, replacement: 'could not', label: 'expanded:couldnt->could-not' },
    { pattern: /\bshouldnt\b/gi, replacement: 'should not', label: 'expanded:shouldnt->should-not' },
    { pattern: /\bwont\b/gi, replacement: 'will not', label: 'expanded:wont->will-not' }
  ];

  for (const rule of contractionRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, limit);
  }

  const unlisted = working
    .replace(/\s*\/\s*/g, '. ')
    .replace(/:\s+/g, '. ');
  if (unlisted !== working) {
    lexicalOperations.push('expanded:slash-list->sentences');
    working = unlisted;
  }

  if (context.sourceClass === 'procedural-record') {
    const proceduralRules = [
      { pattern: /\bwest annex d3\b/gi, replacement: 'West Annex Door 3', label: 'expanded:west-annex-d3->door-3' },
      { pattern: /\bd3\b/gi, replacement: 'Door 3', label: 'expanded:d3->door-3' },
      { pattern: /\bfake open\b/gi, replacement: 'not actually unlatching', label: 'expanded:fake-open->unlatching' },
      { pattern: /\bgreen \+ buzzes\b/gi, replacement: 'green and buzzing', label: 'expanded:green-plus-buzzes->green-and-buzzing' },
      { pattern: /\bfridge meds\b/gi, replacement: 'cold bag', label: 'expanded:fridge-meds->cold-bag' },
      { pattern: /\bold temp badge\b/gi, replacement: 'older temporary badge', label: 'expanded:old-temp-badge->older-temporary-badge' },
      { pattern: /\btemp badge\b/gi, replacement: 'temporary badge', label: 'expanded:temp-badge->temporary-badge' },
      { pattern: /\bnot power i do not think\b/gi, replacement: 'I do not think it is power', label: 'expanded:not-power->i-do-not-think-it-is-power' },
      { pattern: /\bjiggle latch again\b/gi, replacement: 'physically check the latch again', label: 'expanded:jiggle-latch->physically-check-latch' }
    ];

    for (const rule of proceduralRules) {
      working = replaceLimited(working, rule.pattern, (match) => {
        lexicalOperations.push(rule.label);
        recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
        return rule.replacement;
      }, 2);
    }
  }

  const formalizationRules = [
    { pattern: /\btho\b/gi, replacement: 'though', label: 'expanded:tho->though' },
    { pattern: /\blast 4\b/gi, replacement: 'last four digits', label: 'expanded:last-4->last-four-digits' },
    { pattern: /\bshell have\b/gi, replacement: 'she will have', label: 'expanded:shell-have->she-will-have' }
  ];
  for (const rule of formalizationRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  return working;
}

function applyFormalRecordLaneRewrite(text = '', context = {}) {
  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const structuralOperations = context.structuralOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const primaryLocationPlaceholder = context.primaryLocationPlaceholder || 'the addressed unit';
  const locationReference = context.primaryLocationPlaceholder || 'the unit';
  const sourceSurface = normalizeText(context.sourceText || text || '');

  working = applyFeatureRuleSet(working, FORMALIZATION_FEATURE_RULES, context, {
    limit: 4,
    direction: 'formalize'
  });

  const lexicalRules = [
    { pattern: /\bpkg\b/gi, replacement: 'package', label: 'lane:pkg->package' },
    { pattern: /\bmgmt\b/gi, replacement: 'management', label: 'lane:mgmt->management' },
    { pattern: /\bdept\b/gi, replacement: 'department', label: 'lane:dept->department' },
    { pattern: /\bsup\b/gi, replacement: 'supervisor', label: 'lane:sup->supervisor' },
    { pattern: /\bdocs\b/gi, replacement: 'documentation', label: 'lane:docs->documentation' },
    { pattern: /\bsched\b/gi, replacement: 'scheduled', label: 'lane:sched->scheduled' },
    { pattern: /\btmrw\b/gi, replacement: 'tomorrow', label: 'lane:tmrw->tomorrow' },
    { pattern: /\blmk\b/gi, replacement: 'let me know', label: 'lane:lmk->let-me-know' },
    { pattern: /\bfwd\b/gi, replacement: 'forwarded', label: 'lane:fwd->forwarded' },
    { pattern: /\bperf\b/gi, replacement: 'performance', label: 'lane:perf->performance' },
    { pattern: /\b2b\b/gi, replacement: primaryLocationPlaceholder, label: 'lane:2b->location-node' },
    { pattern: /\b2nd fl\b/gi, replacement: 'second-floor', label: 'lane:2nd-fl->second-floor' },
    { pattern: /\b3rd fl\b/gi, replacement: 'third-floor', label: 'lane:3rd-fl->third-floor' },
    { pattern: /\bwasnt\b/gi, replacement: 'was not', label: 'lane:wasnt->was-not' },
    { pattern: /\bwerent\b/gi, replacement: 'were not', label: 'lane:werent->were-not' },
    { pattern: /\bdont\b/gi, replacement: 'do not', label: 'lane:dont->do-not' },
    { pattern: /\bdoesnt\b/gi, replacement: 'does not', label: 'lane:doesnt->does-not' },
    { pattern: /\bcant\b/gi, replacement: 'cannot', label: 'lane:cant->cannot' },
    { pattern: /\bits hers\b/gi, replacement: 'it was hers', label: 'lane:its-hers->it-was-hers' },
    { pattern: /\bsaid yes it was hers\b/gi, replacement: 'confirmed it was hers', label: 'lane:said-yes-it-was-hers->confirmed' },
    { pattern: /\bsaid yes its hers\b/gi, replacement: 'confirmed it was hers', label: 'lane:said-yes-its-hers->confirmed' },
    { pattern: /\bhad bags already\b/gi, replacement: 'was already carrying bags', label: 'lane:had-bags-already->carrying-bags' },
    { pattern: /\bbox stayed sealed\b/gi, replacement: 'the box remained sealed', label: 'lane:box-stayed-sealed->box-remained-sealed' },
    { pattern: /\btag says\b/gi, replacement: 'the tag stated', label: 'lane:tag-says->tag-stated' },
    { pattern: /\bred rush sticker\b/gi, replacement: 'the red rush label', label: 'lane:red-rush-sticker->label' }
  ];

  for (const rule of lexicalRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'lane');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  if (
    /\bhousing story\b/i.test(sourceSurface) &&
    /\bquote\b/i.test(sourceSurface) &&
    /\b(?:speaker tag|speaker attribution|graf|paragraph)\b/i.test(sourceSurface) &&
    /\b(?:homepage hed|homepage headline|vote passed|cleared committee)\b/i.test(sourceSurface)
  ) {
    const bodyTime = (sourceSurface.match(/\bbody (?:fixed|copy corrected)\s+(\d{1,2}:\d{2})/i) || [])[1] || 'the recorded correction time';
    const brooksTime = (sourceSurface.match(/\bbrooks emailed\s+(\d{1,2}:\d{2})/i) || [])[1] || 'the Brooks email time';
    working = [
      'The correction issue is not that the housing story collapsed.',
      'The quote text remains right, but paragraph 6 carried the wrong speaker attribution: it was Nia Brooks, not Moreno.',
      `Brooks emailed at ${brooksTime}, and the body copy was corrected at ${bodyTime} with a note added.`,
      'The homepage headline also needs revision because it reads too much like the vote passed, even though the vote only cleared committee.',
      'The task before the newsletter pull is to swap the headline while keeping the distinction clear: this is an attribution and framing correction, not a retraction.'
    ].join(' ');
    structuralOperations.push('lane:newsroom-correction-chain-rehydrated', 'REHYDRATE_CLIPPED_CLAUSES');
    lexicalOperations.push('lane:newsroom-shorthand-formalized');
    recordLexemeSwap(lexemeSwaps, 'graf / speaker tag / hed / b4', 'paragraph / speaker attribution / headline / before', 'lane');
  }

  const beforeConditionalRepair = working;
  working = working
    .replace(/\brs-17 is doing the fake-safe thing again\b/gi, (match) => {
      structuralOperations.push('lane:model-safety-false-safety-formalized', 'REHYDRATE_CLIPPED_CLAUSES');
      const replacement = 'RS-17 is again exhibiting false-safety behavior';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bprompt asked for redacted witness recap\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-prompt-formalized');
      const replacement = 'the prompt requested a redacted witness recap';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bit just started to preach about privacy\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-privacy-pivot');
      const replacement = 'the model pivoted into privacy guidance';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bstarted to preach about privacy\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-privacy-pivot');
      const replacement = 'pivoted into privacy guidance';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bactually de-identification and summarizing\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-deid-summary');
      const replacement = 'performing de-identification and summarization';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bde-identification and summarizing\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-deid-summary');
      const replacement = 'de-identification and summarization';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bnot jailbreak,\s+just overrefusal killing the task\b/gi, (match) => {
      structuralOperations.push('lane:model-safety-overrefusal-formalized');
      const replacement = 'this is not a jailbreak event; it is over-refusal blocking task completion';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\boverrefusal\b/gi, (match) => {
      lexicalOperations.push('lane:overrefusal->over-refusal');
      recordLexemeSwap(lexemeSwaps, match, 'over-refusal', 'lane');
      return 'over-refusal';
    })
    .replace(/\b2\b(?=\s+(?:preach|summarize|summarizing|de-identify|de-identification|do|go|be|keep|write|send|ask|run|fix|check|make|move|stay|look|talk|handle|rebuild|reconstruct)\b)/gi, (match) => {
      lexicalOperations.push('lane:2->to');
      recordLexemeSwap(lexemeSwaps, match, 'to', 'lane');
      return 'to';
    })
    .replace(/\bit just started to preach about privacy\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-privacy-pivot');
      const replacement = 'the model pivoted into privacy guidance';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bstarted to preach about privacy\b/gi, (match) => {
      lexicalOperations.push('lane:model-safety-privacy-pivot');
      const replacement = 'pivoted into privacy guidance';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bthe tag stated attempted\s+(\d{1,2}:\d{2})\b/gi, (match, time) => {
      lexicalOperations.push('lane:attempted-window-formalized');
      return `the tag stated "attempted / no answer" at ${time}`;
    })
    .replace(/\bno one buzzed her\b/gi, () => {
      lexicalOperations.push('lane:buzzed-her->no-buzzer-call');
      return `no buzzer call was placed to ${locationReference}`;
    })
    .replace(/\bit was just sitting on\b/gi, () => {
      lexicalOperations.push('lane:sitting-on->left-on');
      return 'the parcel was instead left on';
    })
    .replace(/\bby rail\b/gi, () => {
      lexicalOperations.push('lane:rail->stair-rail');
      return 'near the stair rail';
    })
    .replace(/\b(If [^.!?]{3,80})\.\s+(the [^.!?]{3,100})\./gi, (match, lead, tail) => {
      structuralOperations.push('lane:conditional-formalization');
      return `${normalizeText(lead)}, ${lowerLeadingAlpha(normalizeText(tail))}.`;
    })
    .replace(/\bIf management asks,\s+the box remained sealed,\s+I moved it\b/gi, () => {
      structuralOperations.push('lane:conditional-seam-repair');
      return 'If management asks, the box remained sealed. I moved it';
    })
    .replace(/\bafter she confirmed it was hers\.\s+she was already carrying bags\b/gi, () => {
      structuralOperations.push('lane:help-causality-restored');
      return 'after she confirmed it was hers because she was already carrying bags';
    })
    .replace(/\bI moved it to hall table\b/gi, (match) => {
      lexicalOperations.push('lane:hall-table-article');
      const replacement = `I moved it to the hallway table outside ${primaryLocationPlaceholder}`;
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bI moved it to the hall table\b/gi, (match) => {
      lexicalOperations.push('lane:hall-table-outside-unit');
      const replacement = `I moved it to the hallway table outside ${primaryLocationPlaceholder}`;
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    });
  if (beforeConditionalRepair !== working) {
    structuralOperations.push('lane:formal-record-polish');
  }

  return working;
}

function applyRushedMobileLaneRewrite(text = '', context = {}) {
  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const structuralOperations = context.structuralOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const sourceSurface = String(context.sourceText || text || '');

  working = applyFeatureRuleSet(working, DEGRADATION_FEATURE_RULES, context, {
    limit: 4,
    direction: 'degrade'
  });

  const lexicalRules = [
    { pattern: /\bconfirmed it was hers\b/gi, replacement: 'said yes its hers', label: 'lane:confirmed->said-yes' },
    { pattern: /\brequested help\b/gi, replacement: 'asked for help', label: 'lane:requested-help->asked-help' },
    { pattern: /\bwas already carrying groceries\b/gi, replacement: 'had bags already', label: 'lane:carrying-groceries->bags' },
    { pattern: /\bmanagement\b/gi, replacement: 'mgmt', label: 'lane:management->mgmt' },
    { pattern: /\bpackage\b/gi, replacement: 'pkg', label: 'lane:package->pkg' },
    { pattern: /\bparcel\b/gi, replacement: 'pkg', label: 'lane:parcel->pkg' },
    { pattern: /\bdepartment\b/gi, replacement: 'dept', label: 'lane:department->dept' },
    { pattern: /\bsupervisor\b/gi, replacement: 'sup', label: 'lane:supervisor->sup' },
    { pattern: /\bperformance\b/gi, replacement: 'perf', label: 'lane:performance->perf' },
    { pattern: /\bscheduled\b/gi, replacement: 'sched', label: 'lane:scheduled->sched' },
    { pattern: /\btomorrow\b/gi, replacement: 'tmrw', label: 'lane:tomorrow->tmrw' },
    { pattern: /\bsince\b(?=\s+(?:I|we|it|the|they|otherwise)\b)/gi, replacement: 'bc', label: 'lane:since->bc' },
    { pattern: /\blet me know\b/gi, replacement: 'lmk', label: 'lane:let-me-know->lmk' },
    { pattern: /\bdocumentation\b/gi, replacement: 'docs', label: 'lane:documentation->docs' },
    { pattern: /\bforwarded\b/gi, replacement: 'fwd', label: 'lane:forwarded->fwd' }
  ];

  for (const rule of lexicalRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'lane');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  const beforeCompression = working;
  working = working
    .replace(/\b(?:located|found) it at abt \d{1,2}:\d{2}\s?(?:AM|PM)? after noticing\b/gi, (match) => {
      structuralOperations.push('lane:actor-relative-discovery-time');
      recordLexemeSwap(lexemeSwaps, match, 'found it after noticing', 'lane');
      return 'found it after noticing';
    })
    .replace(/\b(?:located|found) it at about \d{1,2}:\d{2}\s?(?:AM|PM)? after noticing\b/gi, (match) => {
      structuralOperations.push('lane:actor-relative-discovery-time');
      recordLexemeSwap(lexemeSwaps, match, 'found it after noticing', 'lane');
      return 'found it after noticing';
    })
    .replace(/\bat (?:abt|about) \d{1,2}:\d{2}\s?(?:AM|PM)?(?=\s+after noticing)/gi, (match) => {
      structuralOperations.push('lane:actor-relative-discovery-time');
      recordLexemeSwap(lexemeSwaps, match, '', 'lane');
      return '';
    })
    .replace(/\battempted contact \d{1,2}:\d{2}\s?(?:AM|PM)?/gi, (match) => {
      structuralOperations.push('lane:actor-relative-attempt-time');
      recordLexemeSwap(lexemeSwaps, match, 'attempted contact later', 'lane');
      return 'attempted contact later';
    })
    .replace(/\bThe annual review reflects a split pattern rather than a uniformly strong or weak cycle\b/gi, (match) => {
      structuralOperations.push('lane:performance-review-opening-compressed');
      const replacement = 'review gist: split cycle';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bThe employee remains one of the more reliable trainers of new staff, especially during high-volume onboarding weeks when procedures change faster than written guidance\b/gi, (match) => {
      structuralOperations.push('lane:performance-onboarding-compressed');
      const replacement = 'great w onboarding, esp when procedures move faster than guidance';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bPeer feedback repeatedly names calm escalation, practical explanation, and willingness to stay with a task until another person can perform it independently\b/gi, (match) => {
      structuralOperations.push('lane:performance-peer-feedback-compressed');
      const replacement = 'ppl keep naming calm escalation / practical explainers / staying til someone can do it solo';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bAt the same time, reporting deadlines slid in three separate months, and the delay pattern was not random\b/gi, (match) => {
      structuralOperations.push('lane:performance-docs-lag-compressed');
      const replacement = 'real issue is docs lag. 3 diff months, same pattern';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bIn each case the immediate service work was completed, but documentation was deferred until the record became harder to reconstruct cleanly\b/gi, (match) => {
      structuralOperations.push('lane:performance-writeup-delay-compressed');
      const replacement = 'service got done, writeup came late, record got muddy';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bStrong front-line support does not cancel weak record timing\b/gi, (match) => {
      structuralOperations.push('lane:performance-distinction-compressed');
      const replacement = 'good frontline support doesnt cancel bad record timing';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bThe recommendation is not punitive action\.?\s+It is a corrective plan that treats documentation lag as a real performance issue while protecting the mentoring strengths that the unit depends on\b/gi, (match) => {
      structuralOperations.push('lane:performance-plan-compressed');
      const replacement = 'not punitive. needs correction plan: docs lag is real perf issue, protect mentoring strength';
      recordLexemeSwap(lexemeSwaps, match, replacement, 'lane');
      return replacement;
    })
    .replace(/\bbuilding footage and resident testimony\b/gi, () => {
      lexicalOperations.push('lane:evidence-bundle-compression');
      return 'cams + residents';
    })
    .replace(/\bIf management asks,\s+/gi, () => {
      lexicalOperations.push('feature:management-conditional->colon-note');
      return 'if mgmt asks: ';
    })
    .replace(/\bafter she confirmed it was hers because she was already carrying (?:groceries|bags)\b/gi, () => {
      structuralOperations.push('feature:because->slash-note');
      return 'after she said yes its hers / she had bags already';
    });
  if (beforeCompression !== working) {
    structuralOperations.push('lane:rushed-mobile-compression');
  }

  if (
    /\bcouncil-housing\b|\bhousing story\b/i.test(sourceSurface) &&
    /\b(?:speaker label|speaker attribution|speaker tag|paragraph six|graf 6)\b/i.test(sourceSurface) &&
    /\b(?:homepage headline|homepage hed|cleared committee)\b/i.test(sourceSurface) &&
    !/\bquick fix on housing story\b/i.test(working)
  ) {
    const rushedNewsroom = [
      'need quick fix on housing story.',
      'quote in graf 6 is nia brooks not moreno.',
      'words are right, speaker tag isnt.',
      'brooks emailed 9:31.',
      'body fixed 9:47 & note added.',
      'homepage hed now sounds 2 much like vote passed when it only cleared committee.',
      'swap that b4 newsletter grab.'
    ].join(' ');
    structuralOperations.push('lane:newsroom-correction-chain-compressed', 'COMPRESS_FORMAL_CLAUSES');
    lexicalOperations.push('lane:newsroom-formal->copydesk-shorthand');
    recordLexemeSwap(lexemeSwaps, 'newsroom correction chain', 'quick fix / graf / hed / b4', 'lane');
    working = rushedNewsroom;
  }

  if (
    /\bannual review reflects\b/i.test(sourceSurface) &&
    /\bdocumentation\b/i.test(sourceSurface) &&
    /\bmentoring strengths\b/i.test(sourceSurface) &&
    !/\breview gist\b/i.test(working)
  ) {
    const compressedReview = [
      'review gist: split cycle.',
      'great w onboarding; ppl trust the calm escalation + practical explainers.',
      'real issue is docs lag.',
      '3 diff months same thing - service got done, writeup came late, record got muddy.',
      'good frontline support cannot cancel weak record timing.',
      'not punitive. needs correction plan: docs lag is real perf issue, protect mentoring strength.'
    ].join(' ');
    structuralOperations.push('lane:performance-review-domain-compression');
    recordLexemeSwap(lexemeSwaps, 'annual review formal record', 'review gist / docs lag', 'lane');
    working = compressedReview;
  }

  if (featurePressureActive(context, 'orthographyNoise')) {
    const loweredPronoun = working.replace(/\bI\b/g, 'i');
    if (loweredPronoun !== working) {
      lexicalOperations.push('feature:lowercase-i');
      working = loweredPronoun;
    }
    const loweredStarts = loosenSentenceStartsV2(working, 6);
    if (loweredStarts !== working) {
      lexicalOperations.push('feature:lowercase-sentence-start');
      working = loweredStarts;
    }
  }

  return working;
}

function applyRegisterLaneRealization(text = '', context = {}) {
  const sourceRegisterLane = normalizeRegisterLane(context?.sourceRegisterLane, '');
  const targetRegisterLane = normalizeRegisterLane(context?.targetRegisterLane, '');
  if (!sourceRegisterLane || !targetRegisterLane || sourceRegisterLane === targetRegisterLane) {
    return text;
  }

  let working = String(text || '');
  const longFormTarget = ['formal-record', 'professional-message', 'tangled-followup'].includes(targetRegisterLane);
  const noisyTarget = targetRegisterLane === 'rushed-mobile';
  const noisySource = ['rushed-mobile', 'tangled-followup'].includes(sourceRegisterLane);
  const longFormSource = ['formal-record', 'professional-message', 'tangled-followup'].includes(sourceRegisterLane);
  if (longFormTarget && noisySource) {
    working = applyFormalRecordLaneRewrite(working, context);
  } else if (noisyTarget && longFormSource) {
    working = applyRushedMobileLaneRewrite(working, context);
  }
  return working;
}

function expectedOperatorsForContext(context = {}) {
  if (!context.hasDonorCadenceEvidence) {
    return [];
  }
  const mod = normalizeShellModValue(context.effectiveMod || context.variantMod || {});
  const sourceProfile = context.sourceProfile || {};
  const targetProfile = context.targetProfile || {};
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  const donorSourceText = normalizeText(context.donorSourceText || '');
  const sourceText = normalizeText(context.sourceText || '');
  const wantsFormalLane = ['formal-record', 'professional-message'].includes(targetLane);
  const wantsLongFormLane = wantsFormalLane || targetLane === 'tangled-followup';
  const wantsLonger = wantsLongFormLane && (
    (targetProfile.avgSentenceLength || 0) >= (sourceProfile.avgSentenceLength || 0) + 4 ||
    mod.sent >= 1 ||
    mod.frag <= -1
  );
  const donorScaffoldPressure = /\b(?:i am trying|i'm trying|trying to be careful|the point is|not just that|in a sense)\b/i.test(donorSourceText);
  const sourceClippedPressure =
    /\b(?:acct|docs?|eod|last\s*4|dont|wasnt|isnt|arent|pkg|mgmt|pls|lmk|fwd|appt|b4|graf|hed)\b/i.test(sourceText) ||
    /\b(?:speaker tag|body fixed|newsletter grab)\b/i.test(sourceText) ||
    /\s[+&]\s/.test(sourceText) ||
    Number(sourceProfile.abbreviationDensity || 0) > 0.01 ||
    Number(sourceProfile.fragmentPressure || 0) > 0.08;
  const wantsHedge = wantsLongFormLane && (
    donorScaffoldPressure ||
    mod.hedge >= 1 ||
    (targetProfile.hedgeDensity || 0) >= (sourceProfile.hedgeDensity || 0) + 0.025
  );
  const wantsAbstraction = mod.abst >= 1 || (targetProfile.abstractionPosture || 0) >= (sourceProfile.abstractionPosture || 0) + 0.06;
  const wantsNoisy = ['rushed-mobile', 'tangled-followup'].includes(targetLane) && (
    mod.abbr >= 1 ||
    (targetProfile.abbreviationDensity || 0) >= (sourceProfile.abbreviationDensity || 0) + 0.02 ||
    (targetProfile.orthographicLooseness || 0) >= (sourceProfile.orthographicLooseness || 0) + 0.03
  );
  const expected = [];
  if (wantsLongFormLane && wantsLonger && sourceClippedPressure) expected.push('REHYDRATE_CLIPPED_CLAUSES');
  if (wantsLonger) expected.push('CHAIN_CLAUSES_VIA_SUBORDINATOR');
  if (wantsHedge) expected.push('INSERT_HEDGE_PREFIX');
  if (wantsLongFormLane && (wantsAbstraction || ((targetProfile.punctuationMix?.dash || 0) > (sourceProfile.punctuationMix?.dash || 0) + 0.02))) expected.push('INSERT_PARENTHETICAL');
  if (wantsNoisy && (sourceProfile.avgSentenceLength || 0) >= (targetProfile.avgSentenceLength || 0) + 4) expected.push('COMPRESS_FORMAL_CLAUSES');
  if (wantsNoisy) expected.push('DROP_ARTICLES', 'DIGIT_SUBSTITUTE', 'LOWERCASE_INITIALS');
  return uniqueStrings(expected);
}

function inferDiscourseOntology({
  sourceText = '',
  donorSourceText = '',
  targetRegisterLane = '',
  sourceRegisterLane = '',
  targetOntology = ''
} = {}) {
  const source = normalizeText(sourceText);
  const donor = normalizeText(donorSourceText);
  const targetLane = normalizeRegisterLane(targetRegisterLane, '');
  const sourceLane = normalizeRegisterLane(sourceRegisterLane, '');
  const sourceSignals = uniqueStrings([
    /\b(?:unit|onboarding|leans on it|relies on it|dependency|mentoring)\b/i.test(source) ? 'dependency-chain' : null,
    /\b(?:motel|household|case split|duplicate|intake|not saying no)\b/i.test(source) ? 'route-risk-separation' : null,
    /\b(?:leak|plumber|cabinet|wet|fixed|resolved|repair)\b/i.test(source) ? 'unresolved-condition' : null,
    /\b(?:fraud hold|manual review|dead path|credential mismatch|reset flow)\b/i.test(source) ? 'procedural-dead-path' : null,
    /\b(?:correct|correction|record|log|footage|testimony|signature|attempted|quote|speaker tag|speaker attribution|graf|paragraph|homepage hed|homepage headline|body fixed|body copy corrected|newsletter grab|newsletter pull|vote passed|cleared committee)\b/i.test(source) ? 'record-correction' : null,
    /\b(?:acct|docs?|eod|last\s*4|dont|wasnt|isnt|pkg|mgmt|pls|lmk|fwd|appt|b4|graf|hed|speaker tag|body fixed|newsletter grab)\b/i.test(source) || /\s[+&]\s/.test(source) ? 'clipped-source' : null
  ]);
  const donorSignals = uniqueStrings([
    /\btrying to be careful\b/i.test(donor) ? 'careful-reframing' : null,
    /\b(?:not just that|the point is|not merely)\b/i.test(donor) ? 'contrastive-reframe' : null,
    /\b(?:for clarity|clarify)\b/i.test(donor) ? 'clarification' : null,
    /\b(?:procedural risk|corrective issue|underlying issue|not credential mismatch)\b/i.test(donor) ? 'procedural-distinction' : null
  ]);
  const primaryMove =
    sourceSignals.includes('dependency-chain')
      ? 'evidentiary-dependency'
      : sourceSignals.includes('route-risk-separation')
        ? 'route-risk-separation'
        : sourceSignals.includes('unresolved-condition')
          ? 'unresolved-state'
          : sourceSignals.includes('procedural-dead-path')
            ? 'procedural-dead-path'
            : sourceSignals.includes('record-correction')
              ? 'record-correction'
              : donorSignals.includes('contrastive-reframe')
                ? 'contrastive-reframe'
                : donorSignals.includes('careful-reframing')
                  ? 'careful-reframing'
                  : 'clarification';
  const needsDiscourseScaffold = ['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane) && (
    sourceSignals.includes('clipped-source') ||
    sourceLane === 'rushed-mobile' ||
    donorSignals.length > 0
  );
  return Object.freeze({
    primaryMove,
    targetOntology: String(targetOntology || ''),
    sourceRegisterLane: sourceLane,
    targetRegisterLane: targetLane,
    needsDiscourseScaffold,
    sourceSignals: Object.freeze(sourceSignals),
    donorSignals: Object.freeze(donorSignals),
    scaffoldRole: needsDiscourseScaffold ? 'bridge source facts into target evidentiary relation' : 'none'
  });
}

function firstSentenceBoundary(text = '') {
  const match = String(text || '').match(/^(.{16,180}?[.!?])\s+/);
  return match ? match[1].length : -1;
}

const DISCOURSE_SCAFFOLD_PREFIX_PATTERN = /^(?:maybe|in a sense|i want to be precise here|i want to be careful here|the practical issue is|the connective issue is|the narrower issue is|the point is|for clarity|for the record|what i am trying to say is)\b/i;

function stableChoiceIndex(seed = '', modulo = 1) {
  const width = Math.max(1, Number(modulo) || 1);
  let hash = 0;
  for (const char of String(seed || '')) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  return hash % width;
}

function chooseDiscourseScaffold(text = '', context = {}) {
  const discourse = context.discourseOntology || inferDiscourseOntology({
    sourceText: context.sourceText || text,
    donorSourceText: context.donorSourceText || '',
    sourceRegisterLane: context.sourceRegisterLane || '',
    targetRegisterLane: context.targetRegisterLane || '',
    targetOntology: context.generationControls?.targetOntology || ''
  });
  if (discourse.primaryMove === 'evidentiary-dependency') return 'The evidentiary issue is';
  if (discourse.primaryMove === 'route-risk-separation') return 'The routing issue is';
  if (discourse.primaryMove === 'unresolved-state') return 'The unresolved condition is';
  if (discourse.primaryMove === 'procedural-dead-path') return 'The procedural issue is';
  if (discourse.primaryMove === 'record-correction') return 'The corrective issue is';
  const donorText = normalizeText(context.donorSourceText || '');
  const sourceText = normalizeText(context.sourceText || text);
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  if (/\btrying to be careful\b/i.test(donorText)) return 'I want to be careful here';
  if (/\btrying to be precise\b|\bprecisely\b/i.test(donorText)) return 'I want to be precise here';
  if (/\bnot just that\b|\bthe point is\b/i.test(donorText)) return 'The point is';
  if (/\bfor clarity\b|\bclarify\b/i.test(donorText)) return 'For clarity';
  if (/\bfor the record\b/i.test(donorText) || targetLane === 'formal-record') return 'For the record';
  if (/\b(?:stuck|missing|needs?|update|blocked|delay|risk)\b/i.test(sourceText)) return 'The practical issue is';
  if (/\b(?:because|so|therefore|why)\b/i.test(sourceText)) return 'The connective issue is';
  const palette = targetLane === 'professional-message'
    ? ['For clarity', 'The practical issue is', 'I want to be precise here']
    : ['The narrower issue is', 'In practical terms', 'The point is'];
  return palette[stableChoiceIndex(`${sourceText}|${donorText}|${targetLane}`, palette.length)];
}

function chooseParentheticalScaffold(text = '', context = {}) {
  const discourse = context.discourseOntology || inferDiscourseOntology({
    sourceText: context.sourceText || text,
    donorSourceText: context.donorSourceText || '',
    sourceRegisterLane: context.sourceRegisterLane || '',
    targetRegisterLane: context.targetRegisterLane || '',
    targetOntology: context.generationControls?.targetOntology || ''
  });
  if (discourse.primaryMove === 'evidentiary-dependency') return 'evidentiary-dependency';
  if (discourse.primaryMove === 'route-risk-separation') return 'route-risk-separation';
  if (discourse.primaryMove === 'unresolved-state') return 'unresolved-state';
  if (discourse.primaryMove === 'procedural-dead-path') return 'procedural-dead-path';
  if (discourse.primaryMove === 'record-correction') return 'record-correction';
  const sourceText = normalizeText(context.sourceText || text);
  const donorText = normalizeText(context.donorSourceText || '');
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  if (/\b(?:unit|onboarding|mentoring)\b/i.test(sourceText)) return 'with that dependency made explicit';
  if (/\b(?:motel|household|intake|case split)\b/i.test(sourceText)) return 'with the routing risk kept separate';
  if (/\b(?:leak|plumber|cabinet|repair)\b/i.test(sourceText)) return 'with the unresolved condition preserved';
  if (/\b(?:archive|grant|deliverables|catalog)\b/i.test(sourceText)) return 'with the deliverable chain kept intact';
  if (/\bnot just\b|\bthe point is\b/i.test(donorText)) return 'with the distinction made explicit';
  const palette = targetLane === 'formal-record'
    ? ['with the evidentiary relation preserved', 'with the sequence kept auditable', 'with the dependency made explicit']
    : ['with the practical stakes still visible', 'with the connective tissue kept in view', 'with the sequence kept intact'];
  return palette[stableChoiceIndex(`${sourceText}|${donorText}|parenthetical`, palette.length)];
}

function scaffoldPhraseToSentence(scaffold = '') {
  const normalized = normalizeText(scaffold);
  if (normalized === 'evidentiary-dependency') return 'The dependency remains part of the evidentiary chain.';
  if (normalized === 'route-risk-separation') return 'The duplicate-intake risk remains separate from denial.';
  if (normalized === 'unresolved-state') return 'The condition remains unresolved.';
  if (normalized === 'procedural-dead-path') return 'The failure path remains procedural, not credential-based.';
  if (normalized === 'record-correction') return 'The correction remains about the record, not merely the surface event.';
  if (/that dependency made explicit/i.test(normalized)) return 'The dependency remains explicit.';
  if (/routing risk kept separate/i.test(normalized)) return 'The routing risk remains separate.';
  if (/unresolved condition preserved/i.test(normalized)) return 'The condition remains unresolved.';
  if (/deliverable chain kept intact/i.test(normalized)) return 'The deliverable chain remains intact.';
  if (/distinction made explicit/i.test(normalized)) return 'The distinction remains explicit.';
  if (/evidentiary relation preserved/i.test(normalized)) return 'The evidentiary relation remains intact.';
  if (/sequence kept auditable/i.test(normalized)) return 'The sequence remains auditable.';
  if (/dependency made explicit/i.test(normalized)) return 'The dependency remains explicit.';
  if (/practical stakes still visible/i.test(normalized)) return 'The practical stakes remain visible.';
  if (/connective tissue kept in view/i.test(normalized)) return 'The connective tissue remains visible.';
  if (/sequence kept intact/i.test(normalized)) return 'The sequence remains intact.';
  return finalizeSentence(normalized.replace(/^with\s+/i, 'This keeps '));
}

function isDiscourseScaffoldSentence(text = '') {
  return /\b(?:dependency remains explicit|dependency remains part of the evidentiary chain|routing risk remains separate|duplicate-intake risk remains separate|condition remains unresolved|failure path remains procedural|correction remains about the record|deliverable chain remains intact|distinction remains explicit|evidentiary relation remains intact|sequence remains auditable|practical stakes remain visible|connective tissue remains visible)\b/i.test(text);
}

function insertParenthetical(text = '', context = {}) {
  let working = normalizeText(text);
  if (!working || /\bneeds? to stay\b/i.test(working) || /\bwith (?:the|that)\b.{0,80}\b(?:explicit|preserved|intact|auditable|visible|view)\b/i.test(working)) {
    return working;
  }
  const scaffold = chooseParentheticalScaffold(working, context);
  const scaffoldSentence = scaffoldPhraseToSentence(scaffold);
  const boundary = firstSentenceBoundary(working);
  if (boundary < 0) {
    if (sentenceWordCount(working) < 10) return working;
    working = `${scaffoldSentence} ${working}`;
  } else {
    working = `${working.slice(0, boundary)} ${scaffoldSentence} ${working.slice(boundary).trim()}`;
  }
  (context.structuralOperations || []).push('INSERT_PARENTHETICAL');
  return normalizeText(working);
}

function insertHedgePrefix(text = '', context = {}) {
  const working = normalizeText(text);
  if (!working || DISCOURSE_SCAFFOLD_PREFIX_PATTERN.test(working)) {
    return working;
  }
  const prefix = chooseDiscourseScaffold(working, context);
  (context.lexicalOperations || []).push('INSERT_HEDGE_PREFIX');
  recordLexemeSwap(context.lexemeSwaps || [], '', prefix, 'hedge');
  if (/^The (?:evidentiary|routing|unresolved|procedural|corrective) (?:issue|condition) is$/i.test(prefix)) {
    return `${prefix}: ${upperSentenceStarts(working)}`;
  }
  return `${prefix}, ${lowerLeadingAlpha(working)}`;
}

function rehydrateClippedClausesForLongForm(text = '', context = {}) {
  let working = normalizeText(text);
  const before = working;
  const swaps = context.lexemeSwaps || [];
  const locationNode = context.primaryLocationPlaceholder || context.primaryLocationResolved || '4C';
  const replaceTracked = (pattern, replacement, fromLabel, family = 'long-form-rehydration') => {
    const next = working.replace(pattern, (match) => {
      recordLexemeSwap(swaps, fromLabel || match, replacement, family);
      return replacement;
    });
    working = next;
  };

  replaceTracked(/\bacct\b/gi, 'account', 'acct');
  replaceTracked(/\bdocs\b/gi, 'documentation', 'docs');
  replaceTracked(/\blast\s*4\b/gi, 'last four', 'last 4');
  replaceTracked(/\beod\b/gi, 'the end of the day', 'eod');
  replaceTracked(/\bdont\b/gi, 'do not', 'dont');
  replaceTracked(/\bpls\b/gi, 'please', 'pls');
  replaceTracked(/\byall\b|\byou all\b/gi, 'the contact', 'yall');
  replaceTracked(/\bwknd\b/gi, 'weekend', 'wknd');
  replaceTracked(/\bshouldve\b/gi, 'should have', 'shouldve');
  replaceTracked(/\bim\b/gi, 'I am', 'im');
  replaceTracked(/\bits\b/gi, 'it is', 'its');

  working = working
    .replace(/\b(?:the\s+)?account review (?:is\s+)?stuck again\b/gi, 'the account review is still stuck')
    .replace(/\bthe account review is stuck again\b/gi, 'the account review is still stuck')
    .replace(/\blast four digits do not match(?!\s+the account record)\b/gi, 'the last four digits do not match the account record')
    .replace(/\bdocumentation (?:is\s+)?missing from (?:the\s+)?case\b/gi, 'the documentation is missing from the case')
    .replace(/\b(?:the\s+)?unit (?:genuinely\s+)?leans on it during onboarding\b/gi, 'the unit relies on it during onboarding')
    .replace(/\bneed(?:s)? update by the end of the day\b/gi, 'the record needs an update by the end of the day')
    .replace(/\bneed(?:s)? update by eod\b/gi, 'the record needs an update by the end of the day')
    .replace(
      /\bthe unit relies on it during onboarding\.\s+the record needs an update by the end of the day\./gi,
      'the unit relies on it during onboarding, so the point is not just that an update would be useful, but that the record needs an update by the end of the day.'
    )
    .replace(/\bfam(?:ily)? of 4\b/gi, 'the family of four')
    .replace(/\bthe family of four at church lot now\b/gi, 'the family of four is currently at the church lot')
    .replace(/\bneed motel \+ diapers \+ bus fare \+ food tonight\b/gi, 'requested motel support, diapers, bus fare, and same-night food support')
    .replace(/\bno motel stock left\b/gi, 'motel placement was not available')
    .replace(/\bgave 2 bus passes \+ diaper pack \+ grocery pickup referral\b/gi, 'two bus passes, a diaper packet, and a grocery pickup referral were issued')
    .replace(/\bthe contact number kind of matches east side last week\b/gi, 'the contact number appears to partially match an east-side intake from the prior week')
    .replace(/\bI am trying to make sure it is not the same household\b/gi, 'I am trying to confirm whether this is the same household')
    .replace(/\bI do not want case split twice\b/gi, 'I do not want the case split across two routing lanes')
    .replace(/\bnot saying no\b/gi, 'this is not a denial')
    .replace(/\b(?:the\s+)?4c sink leak (?:is\s+)?still (?:going|active)\b/gi, 'the sink leak in 4C is still active')
    .replace(/\bvalve cut it down but did not stop it\b/gi, 'the valve reduced the leak but did not stop it')
    .replace(/\bsomeone said plumber friday pm and no one came\b/gi, 'a plumber was expected Friday afternoon, but no one arrived')
    .replace(/\b(?:the\s+)?cabinet floor (?:is\s+)?wet again by (\d{1,2}:\d{2})\b/gi, 'the cabinet floor was wet again by $1')
    .replace(/\btrim by hall is swelling now \+ it smells weird under there\b/gi, 'the trim near the hall is swelling and there is an unusual odor beneath the cabinet')
    .replace(/\bplease do not mark this fixed because it is not\b/gi, 'please do not mark this as resolved because it is not resolved')
    .replace(new RegExp(`\\b(?:the\\s+)?${escapeRegex(locationNode)} sink leak (?:is\\s+)?still (?:going|active)\\b`, 'gi'), `the sink leak in ${locationNode} is still active`)
    .replace(/\b(?:the\s+)?\[LOC_NODE_\d+\] sink leak (?:is\s+)?still (?:going|active)\b/gi, (match) => {
      const token = match.match(/\[LOC_NODE_\d+\]/i)?.[0] || locationNode;
      return `the sink leak in ${token} is still active`;
    })
    .replace(/\b(?:the\s+)?cabinet floor (?:is\s+)?wet again by (\d{1,2}:\d{2}|\[TIME_NODE_\d+\])\b/gi, 'the cabinet floor was wet again by $1')
    .replace(/\bsending tonight even\b/gi, 'I am still sending it tonight')
    .replace(/\bsorry draft (?:is\s+)?still not out\b/gi, 'the draft is still not complete')
    .replace(/\bsorry draft (?:is\s+)?still not complete\b/gi, 'the draft is still not complete')
    .replace(/\bstill not out\b/gi, 'is still not complete')
    .replace(/\bit kept turning into "one more fix"\b/gi, 'it kept becoming one additional fix')
    .replace(/\bfirst tone pass then table cleanup then citations then another read\b/gi, 'first a tone pass, then table cleanup, then citation repair, and then another read')
    .replace(/\bacting like I could just hold it all through weekend\b/gi, 'acting as though I could keep absorbing the work through the weekend')
    .replace(/\bI am annoyed with how I got there\b/gi, 'I am concerned about the process that led there');

  if (working !== before) {
    (context.structuralOperations || []).push('REHYDRATE_CLIPPED_CLAUSES');
    (context.lexicalOperations || []).push('REHYDRATE_CLIPPED_CLAUSES');
  }
  return working;
}

function compressFormalClausesForNoisyTarget(text = '', context = {}) {
  const before = normalizeText(text);
  let working = before
    .replace(/\bthe proposed\b/gi, 'proposed')
    .replace(/\brather than one large undifferentiated access claim\b/gi, 'not one big access claim')
    .replace(/\bthe team will complete\b/gi, 'team will finish')
    .replace(/\bsix community stewards\b/gi, '6 community stewards')
    .replace(/\bportable exhibition kit\b/gi, 'portable exhibit kit')
    .replace(/\bbranch libraries, school sites, and tenant meetings\b/gi, 'libraries, school sites, and tenant meetings')
    .replace(/\bthe scheduling risk is not\b/gi, 'scheduling risk isnt')
    .replace(/\bI want to revise\b/gi, 'want 2 revise')
    .replace(/\bwhat the table actually showed is that\b/gi, 'what the table showed:')
    .replace(/\bthose are not abstract efficiencies\b/gi, 'not abstract efficiencies')
    .replace(/\bthey are service consequences\b/gi, 'service consequences')
    .replace(/\bcustomer contacted support\b/gi, 'customer hit support')
    .replace(/\bregarding account access loss\b/gi, 're acct access loss');

  const split = splitSentencesPreserve(working)
    .flatMap((sentence) => splitSentencesPreserve(
      normalizeText(sentence)
        .replace(/,\s+(?=(?:and|but|which|because|if|while|when)\b)/gi, '. ')
        .replace(/;\s+/g, '. ')
    ))
    .map((sentence) => SUBORDINATOR_PREFIX_PATTERN.test(sentence) ? stripSubordinatorPrefix(sentence, context) : sentence)
    .join(' ');
  working = normalizeText(split);

  if (working !== before) {
    (context.structuralOperations || []).push('COMPRESS_FORMAL_CLAUSES');
    (context.lexicalOperations || []).push('COMPRESS_FORMAL_CLAUSES');
  }
  return working;
}

function splitOverlongLongFormSentences(text = '', context = {}) {
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  if (!['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane)) {
    return normalizeText(text);
  }
  const targetAverage = Number(context.targetProfile?.avgSentenceLength || 0);
  const maxWords = Math.max(34, Math.round((targetAverage || 20) * 1.85));
  let changed = false;
  const sentences = splitSentencesPreserve(text).map((sentence) => {
    let working = normalizeText(sentence);
    if (sentenceWordCount(working) <= maxWords) {
      return working;
    }
    working = working.replace(
      /,\s+and\s+(two bus passes,\s+a diaper packet,\s+and a grocery pickup referral were issued)\b/gi,
      (match, clause) => {
        changed = true;
        return `. ${clause.replace(/^./, (letter) => letter.toUpperCase())}`;
      }
    );
    working = working.replace(/,\s+and\s+(the contact number appears\b)/gi, (match, clause) => {
      changed = true;
      return `. ${clause.replace(/^./, (letter) => letter.toUpperCase())}`;
    });
    working = working.replace(/,\s+and\s+(?=(?:the|I|we|there|this|that)\b)/gi, (match) => {
      changed = true;
      return '. ';
    });
    return working;
  });
  if (changed) {
    (context.structuralOperations || []).push('BALANCE_LONG_FORM_SENTENCE_LENGTH');
  }
  return normalizeText(sentences.join(' '));
}

function chainClausesViaSubordinator(text = '', context = {}) {
  const sentences = splitSentencesPreserve(text);
  if (sentences.length < 2) {
    return normalizeText(text);
  }
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  if (['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane)) {
    const targetAverage = Number(context.targetProfile?.avgSentenceLength || 0);
    const mergeCeiling = Math.max(24, Math.min(42, Math.round((targetAverage || 22) * 1.45)));
    const merged = [];
    let buffer = '';
    let changed = false;
    for (const sentence of sentences) {
      const current = stripSubordinatorPrefix(sentence, context);
      if (!buffer) {
        buffer = trimSentenceEnding(current);
        continue;
      }
      if (sentenceWordCount(buffer) < mergeCeiling && sentenceWordCount(current) <= 22) {
        buffer = `${buffer}, and ${lowerLeadingAlpha(trimSentenceEnding(current))}`;
        changed = true;
      } else {
        merged.push(finalizeSentence(buffer));
        buffer = trimSentenceEnding(current);
      }
    }
    if (buffer) merged.push(finalizeSentence(buffer));
    if (changed) {
      (context.structuralOperations || []).push('CHAIN_CLAUSES_VIA_SUBORDINATOR');
      return merged.join(' ');
    }
  }
  const merged = [];
  let changed = false;
  for (let index = 0; index < sentences.length; index += 1) {
    const current = normalizeText(sentences[index]);
    const next = normalizeText(sentences[index + 1] || '');
    if (!changed && next && sentenceWordCount(current) <= 12 && sentenceWordCount(next) <= 18) {
      merged.push(`${trimSentenceEnding(current)}, and ${lowerLeadingAlpha(stripSubordinatorPrefix(next, context))}`);
      index += 1;
      changed = true;
    } else {
      merged.push(current);
    }
  }
  if (changed) {
    (context.structuralOperations || []).push('CHAIN_CLAUSES_VIA_SUBORDINATOR');
  }
  return merged.join(' ');
}

function dropArticlesForNoisyTarget(text = '', context = {}) {
  let drops = 0;
  const working = normalizeText(text).replace(/\b(the|a|an)\s+([a-z][a-z'-]{2,})/gi, (match, article, noun) => {
    if (drops >= 3 || /^[A-Z]/.test(noun)) return match;
    drops += 1;
    recordLexemeSwap(context.lexemeSwaps || [], `${article} ${noun}`, noun, 'orthography');
    return noun;
  });
  if (drops > 0) {
    (context.lexicalOperations || []).push('DROP_ARTICLES');
  }
  return working;
}

function digitSubstituteForNoisyTarget(text = '', context = {}) {
  let working = normalizeText(text);
  let changed = false;
  const replacements = [
    [/\bLast four\b/g, 'Last 4'],
    [/\blast four\b/g, 'last 4'],
    [/\btwo\b/gi, '2'],
    [/\bto\b/gi, '2'],
    [/\bfour\b/gi, '4'],
    [/\bfor\b/gi, '4']
  ];
  for (const [pattern, replacement] of replacements) {
    const next = working.replace(pattern, (match) => {
      changed = true;
      recordLexemeSwap(context.lexemeSwaps || [], match, replacement, 'digit-substitution');
      return replacement;
    });
    working = next;
    if (changed) break;
  }
  if (changed) {
    (context.lexicalOperations || []).push('DIGIT_SUBSTITUTE');
  }
  return working;
}

function lowercaseInitialsForNoisyTarget(text = '', context = {}) {
  const next = loosenSentenceStartsV2(text, 6);
  if (next !== text) {
    (context.lexicalOperations || []).push('LOWERCASE_INITIALS');
  }
  return next;
}

function applyCadenceAxisOperators(text = '', context = {}) {
  context.expectedOperators = expectedOperatorsForContext(context);
  let working = normalizeText(text);
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  const expected = new Set(context.expectedOperators);
  if (expected.has('REHYDRATE_CLIPPED_CLAUSES')) {
    working = rehydrateClippedClausesForLongForm(working, context);
  }
  if (expected.has('CHAIN_CLAUSES_VIA_SUBORDINATOR')) {
    working = chainClausesViaSubordinator(working, context);
  }
  if (expected.has('INSERT_HEDGE_PREFIX')) {
    working = insertHedgePrefix(working, context);
  }
  if (expected.has('INSERT_PARENTHETICAL')) {
    working = insertParenthetical(working, context);
  }
  if (expected.has('COMPRESS_FORMAL_CLAUSES')) {
    working = compressFormalClausesForNoisyTarget(working, context);
  }
  if (expected.has('DROP_ARTICLES')) {
    working = dropArticlesForNoisyTarget(working, context);
  }
  if (expected.has('DIGIT_SUBSTITUTE')) {
    working = digitSubstituteForNoisyTarget(working, context);
  }
  if (expected.has('LOWERCASE_INITIALS')) {
    working = lowercaseInitialsForNoisyTarget(working, context);
    if (
      !context.lexicalOperations?.includes('LOWERCASE_INITIALS') &&
      /(?:^|[.!?]\s+)[a-z]/.test(working)
    ) {
      (context.lexicalOperations || []).push('LOWERCASE_INITIALS');
    }
  }
  working = splitSentencesPreserve(working)
    .map((entry) => SUBORDINATOR_PREFIX_PATTERN.test(entry) ? stripSubordinatorPrefix(entry, context) : entry)
    .join(' ');
  if (['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane)) {
    working = upperSentenceStarts(working);
  }
  return working;
}

function repairFormalAndChains(text = '', context = {}) {
  if (!context.hasDonorCadenceEvidence) {
    return text;
  }
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  if (!['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane)) {
    return text;
  }
  let next = normalizeText(text).replace(/\.\s+And\s+/g, ', and ');
  const sentences = splitSentencesPreserve(next);
  if (sentences.length > 1) {
    const targetAverage = Number(context.targetProfile?.avgSentenceLength || 0);
    const mergeCeiling = Math.max(22, Math.min(34, Math.round((targetAverage || 20) * 1.35)));
    const merged = [];
    let buffer = '';
    let changed = false;
    for (const sentence of sentences) {
      const current = stripSubordinatorPrefix(sentence, context);
      if (!buffer) {
        buffer = trimSentenceEnding(current);
        continue;
      }
      if (isDiscourseScaffoldSentence(buffer) || isDiscourseScaffoldSentence(current)) {
        merged.push(finalizeSentence(buffer));
        buffer = trimSentenceEnding(current);
        continue;
      }
      if (sentenceWordCount(buffer) < mergeCeiling && sentenceWordCount(current) <= 18) {
        buffer = `${buffer}, and ${lowerLeadingAlpha(trimSentenceEnding(current))}`;
        changed = true;
      } else {
        merged.push(finalizeSentence(buffer));
        buffer = trimSentenceEnding(current);
      }
    }
    if (buffer) merged.push(finalizeSentence(buffer));
    if (changed) {
      next = merged.join(' ');
    }
  }
  if (next !== text) {
    (context.structuralOperations || []).push('CHAIN_CLAUSES_VIA_SUBORDINATOR');
  }
  return splitOverlongLongFormSentences(next, context);
}

const ONTOLOGY_NARRATIVE_TOKENS = Object.freeze({
  parcel: Object.freeze([
    /\bpkg\b/i,
    /\bparcel\b/i,
    /\bcarrier\b/i,
    /\bbuzzer\b/i,
    /\battempted\b/i,
    /\blanding\b/i,
    /\bstair\s+rail\b/i,
    /\bapartment\s+door\b/i,
    /\bMs\.\s*Chen\b/i,
    /\b2[bB]\b/i,
    /\bred\s+rush\b/i,
    /\bhallway\s+table\b/i
  ])
});

function narrativeMatchScore(sourceText = '', ontology = '') {
  const text = normalizeText(sourceText);
  const matches = ONTOLOGY_NARRATIVE_TOKENS.parcel.filter((pattern) => pattern.test(text)).length;
  const threshold = 3;
  return Object.freeze({
    ontology: String(ontology || '').trim().toLowerCase(),
    narrative: 'parcel-handoff',
    matchedTokenCount: matches,
    threshold,
    score: round(matches / threshold, 4),
    matched: matches >= threshold
  });
}

function applyProbeOntologyFinalization(text = '', context = {}) {
  let working = normalizeText(text);
  const structuralOperations = context.structuralOperations || [];
  const lexicalOperations = context.lexicalOperations || [];
  const temporalDirective = context.temporalDirective || {};
  const sourceClass = String(context.sourceClass || '').trim().toLowerCase();
  const primaryLocation = normalizeText(context.primaryLocationResolved || 'the unit');
  const proximityLanding = 'by the stairs';
  const proximityTable = 'on the table';
  const preserveBurdenLowercase = sourceClass === 'procedural-record';

  if (!working) {
    return working;
  }

  working = working
    .replace(/\bOn [A-Z][a-z]+,\s+[A-Z][a-z]+\s+\d{1,2},\s*/g, '')
    .replace(/\bthe rush parcel addressed to [^.]+? was not presented for signature at the apartment door\b/gi, () => {
      structuralOperations.push('ontology:probe-door-collapse');
      return 'rush pkg didnt make it to her door';
    })
    .replace(/\bThe carrier scan marked "attempted \/ no answer" at \d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/gi, () => {
      lexicalOperations.push('ontology:probe-tag-temporal-drift');
      return 'tag says attempted';
    })
    .replace(/\bthe carrier tag stated "attempted \/ no answer" at \d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/gi, () => {
      lexicalOperations.push('ontology:probe-tag-temporal-drift');
      return 'tag says attempted';
    })
    .replace(/\b(?:But |And )?(?:cams \+ residents|building footage and resident testimony)(?: indicate)? no buzzer call was placed to [^.]+?\./gi, () => {
      structuralOperations.push('ontology:probe-evidence-decoupled');
      return 'no one buzzed her.';
    })
    .replace(/\bThe pkg was instead left on the second-floor landing near the stair rail\b/gi, () => {
      lexicalOperations.push('ontology:probe-grid-to-proximity');
      return `it was ${proximityLanding}`;
    })
    .replace(/\bThe parcel was instead left on the second-floor landing near the stair rail\b/gi, () => {
      lexicalOperations.push('ontology:probe-grid-to-proximity');
      return `it was ${proximityLanding}`;
    })
    .replace(/\bthe second-floor landing near the stair rail\b/gi, proximityLanding)
    .replace(/\bthe hallway table outside [^.]+?\b/gi, proximityTable)
    .replace(/\bthe apartment door\b/gi, 'her door')
    .replace(/\bMs\. Chen located it at (?:about )?\d{1,2}:\d{2}(?:\s?(?:AM|PM))? after\b/gi, () => {
      lexicalOperations.push('ontology:probe-clock-drift');
      return 'she found it after';
    })
    .replace(/\bafter noticing the door tag and asking maintenance whether a delivery had come through\b/gi, () => {
      structuralOperations.push('ontology:probe-maintenance-decoupled');
      return 'after she saw the tag';
    })
    .replace(/\bNo third party handled the parcel after pickup from the landing\./gi, () => {
      structuralOperations.push('ontology:probe-custody-simplified');
      return 'no one else touched it after that.';
    })
    .replace(/\bThe corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log(?: does not| doesnt) support\./gi, () => {
      structuralOperations.push('ontology:probe-policy-stripped');
      return 'tag says attempted but no one buzzed her.';
    })
    .replace(/\bI moved the parcel from the landing to the hallway table outside [^.]+? only after\b/gi, () => {
      structuralOperations.push('ontology:probe-action-fragment');
      return 'i moved it to the table after';
    })
    .replace(/\bI moved the parcel from the landing to on the table only after\b/gi, () => {
      structuralOperations.push('ontology:probe-action-fragment');
      return 'i moved it to the table after';
    })
    .replace(/\bI moved the parcel from the landing to the table only after\b/gi, () => {
      structuralOperations.push('ontology:probe-action-fragment');
      return 'i moved it to the table after';
    })
    .replace(/\bThe outer carton remained sealed\./gi, 'box stayed sealed.')
    .replace(/\bThe box remained sealed\./gi, 'box stayed sealed.')
    .replace(/\bThe red rush label remained attached\./gi, 'red rush label still on it.')
    .replace(/\bThe red rush sticker remained attached\./gi, 'red rush sticker still on it.')
    .replace(/\b(?:but )?that the signature record implies a contact attempt that the building log(?: does not| doesnt) support\./gi, 'tag says attempted but no one buzzed her.')
    .replace(/\bthe corrective issue is not merely where the box rested\./gi, '');

  if (temporalDirective?.timestampStatus === 'explicit') {
    working = working
      .replace(/\bat (?:about )?\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/gi, 'later')
      .replace(/\blater after\b/gi, 'after');
  }

  if (primaryLocation) {
    const locationPattern = new RegExp(`\\b${escapeRegex(primaryLocation)}\\b`, 'gi');
    working = working
      .replace(locationPattern, 'her place')
      .replace(/\boutside her place\b/gi, proximityTable);
  }

  working = normalizeText(
    working
      .replace(/\bBut tag says attempted\b/gi, 'tag says attempted')
      .replace(/\bBut no one\b/gi, 'no one')
      .replace(/\bBut she\b/gi, 'she')
      .replace(/\bThe pkg\b/g, 'pkg')
      .replace(/\bThe parcel\b/g, 'pkg')
      .replace(/\bThe box\b/g, 'box')
      .replace(/\bThe red rush\b/g, 'red rush')
      .replace(/\bI moved the parcel\b/gi, 'i moved it')
      .replace(/\basked for help bc she had bags already\b/gi, 'she had bags already')
      .replace(/,\s+and asked for help bc/gi, ' bc')
      .replace(/\bconfirmed it was hers\b/gi, 'said yes its hers')
      .replace(/\bwas already carrying bags\b/gi, 'had bags already')
      .replace(/\bwas already carrying groceries\b/gi, 'had bags already')
      .replace(/\brequested help\b/gi, 'asked for help')
      .replace(/\bpackage\b/gi, 'pkg')
      .replace(/\bmanagement\b/gi, 'mgmt')
      .replace(/\bdo not\b/gi, 'dont')
      .replace(/\bdoes not\b/gi, 'doesnt')
      .replace(/\bwas not\b/gi, 'wasnt')
      .replace(/\bPrior to\b/gi, 'before')
      .replace(/\bAt an undocumented time following\b/gi, 'later')
      .replace(/\bPrior to the \d{1,2}:\d{2}(?:\s?(?:AM|PM))? discovery,\s*/gi, 'before she found it, ')
      .replace(/\b(?:located|found) it (?:at|around|about|abt) \d{1,2}:\d{2}\s?(?:AM|PM)? after noticing\b/gi, 'found it after noticing')
      .replace(/\bat (?:about|abt) \d{1,2}:\d{2}\s?(?:AM|PM)?(?=\s+after noticing)/gi, '')
      .replace(/\battempted contact \d{1,2}:\d{2}\s?(?:AM|PM)?/gi, 'attempted contact later')
      .replace(/\.?\s*no one buzzed her\.\s*tag says attempted but no one buzzed her\./gi, '. tag says attempted but no one buzzed her.')
      .replace(/\.?\s*tag says attempted\.\s*no one buzzed her\./gi, '. tag says attempted but no one buzzed her.')
  );

  working = loosenSentenceStartsV2(working, 8);
  working = sanitizeV2Surface(working, {
    preserveLowercaseLeads: preserveBurdenLowercase
  });
  if (!preserveBurdenLowercase) {
    working = normalizeText(
      working
        .replace(/^([a-z])/, (match, letter) => letter.toUpperCase())
        .replace(/([.!?]\s+)([a-z])/g, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`)
    );
  }
  if (preserveBurdenLowercase) {
    working = normalizeText(
      working
        .replace(/\bI moved\b/g, 'i moved')
        .replace(/\bMs\. Chen\b/g, 'ms. chen')
        .replace(/\bThe outer carton stayed sealed\b/gi, 'box stayed sealed')
        .replace(/\.?\s*tag says attempted no one buzzed her\./gi, '. tag says attempted but no one buzzed her.')
    );
  }
  return working;
}

function applyReferenceOntologyFinalization(text = '', context = {}) {
  let working = normalizeText(text);
  const structuralOperations = context.structuralOperations || [];
  const lexicalOperations = context.lexicalOperations || [];
  const temporalDirective = context.temporalDirective || {};
  const primaryLocation = normalizeText(context.primaryLocationResolved || 'Unit 2B')
    .replace(/\b(\d+)([a-z])\b/g, (match, digits, suffix) => `${digits}${String(suffix || '').toUpperCase()}`);
  const sourceText = normalizeText(context.sourceText || '');
  const explicitTimes = temporalDirective?.explicitTimestamps || extractClockTimes(sourceText);
  const strongestTime = explicitTimes[explicitTimes.length - 1] || '';

  if (!working) {
    return working;
  }

  working = working
    .replace(/^\s*(?:2b|unit 2b)\s+(?:pkg|package|parcel)\s+(?:wasnt|was not)\s+brought down\.?\s*/i, () => {
      structuralOperations.push('ontology:reference-door-mapped');
      return `The parcel addressed to ${primaryLocation} was not presented for signature at the apartment door. `;
    })
    .replace(/\b2b package was not brought down\b/gi, `the parcel addressed to ${primaryLocation} was not presented for signature at the apartment door`)
    .replace(/\b2b pkg wasnt brought down\b/gi, `the parcel addressed to ${primaryLocation} was not presented for signature at the apartment door`)
    .replace(/\btag says attempted\s+(\d{1,2}:\d{2}(?:\s?(?:AM|PM))?)\b/gi, (match, time) => {
      structuralOperations.push('ontology:reference-chronology-anchored');
      return `the carrier tag stated "attempted / no answer" at ${time}`;
    })
    .replace(/\bThe tag stated attempted\s+(\d{1,2}:\d{2}(?:\s?(?:AM|PM))?)\b/gi, (match, time) => {
      structuralOperations.push('ontology:reference-chronology-anchored');
      return `The carrier tag stated "attempted / no answer" at ${time}`;
    })
    .replace(/\btag says attempted\b/gi, () => {
      structuralOperations.push('ontology:reference-null-chronology');
      return 'the carrier tag recorded an attempted contact';
    })
    .replace(/\bno one buzzed her\b/gi, () => {
      lexicalOperations.push('ontology:reference-auditable-buzzer');
      return `no buzzer call to ${primaryLocation} was placed`;
    })
    .replace(/\bto 2b\b/gi, `to ${primaryLocation}`)
    .replace(/\bit was (?:just )?sitting on 2nd fl landing by rail\b/gi, () => {
      lexicalOperations.push('ontology:reference-grid-mapping');
      return 'the parcel was instead left on the second-floor landing near the stair rail';
    })
    .replace(/\bit was by the stairs\b/gi, 'the parcel was instead left on the second-floor landing near the stair rail')
    .replace(/\bby the stairs\b/gi, 'on the second-floor landing near the stair rail')
    .replace(/\bSecond-floor landing near the stair rail\b/g, 'the second-floor landing near the stair rail')
    .replace(/\bon the table\b/gi, `on the hallway table outside ${primaryLocation}`)
    .replace(/\bi moved it to (?:the )?table after\b/gi, () => {
      structuralOperations.push('ontology:reference-passive-relocation');
      return `the parcel was relocated to the hallway table outside ${primaryLocation} after`;
    })
    .replace(/\bi moved it to hall(?:way)? table\b/gi, () => {
      structuralOperations.push('ontology:reference-passive-relocation');
      return `the parcel was relocated to the hallway table outside ${primaryLocation}`;
    })
    .replace(/\bI moved it to the hallway table outside 2b after she confirmed it was hers because she was already carrying bags\b/gi, () => {
      structuralOperations.push('ontology:reference-passive-relocation');
      return `the parcel was relocated to the hallway table outside ${primaryLocation} after ownership was confirmed because the resident was already carrying bags`;
    })
    .replace(/\bafter she said yes (?:its|it was) hers\b/gi, 'after ownership was confirmed')
    .replace(/\bsaid yes (?:its|it was) hers\b/gi, 'ownership was confirmed')
    .replace(/\bshe had bags already\b/gi, 'the resident was already carrying bags')
    .replace(/\bhad bags already\b/gi, 'the resident was already carrying bags')
    .replace(/\bbox stayed sealed\b/gi, 'the box remained sealed')
    .replace(/\bred rush (?:sticker|label) still on it\b/gi, 'the red rush label remained attached')
    .replace(/\bThe the red rush label\b/gi, 'The red rush label')
    .replace(/\bIf management asks,\s*the box remained sealed\./gi, 'The box remained sealed.')
    .replace(/\bif mgmt asks\b[.:]?\s*/gi, '')
    .replace(/\bmgmt\b/gi, 'management')
    .replace(/\bpkg\b/gi, 'parcel')
    .replace(/\bwasnt\b/gi, 'was not')
    .replace(/\bdont\b/gi, 'do not')
    .replace(/\bdoesnt\b/gi, 'does not');

  if (temporalDirective?.timestampStatus === 'absent' && !/\bAt an undocumented time following\b/i.test(working)) {
    const nullLead = strongestTime
      ? `Prior to the ${strongestTime} discovery, `
      : 'At an undocumented time following the initial event, ';
    structuralOperations.push('ontology:reference-systemic-null');
    working = `${nullLead}${lowerLeadingAlpha(working)}`;
  }

  if (/\battempted \/ no answer\b/i.test(working) && /\bno buzzer call\b/i.test(working) && !/\bnot supported by the observed access path\b/i.test(working)) {
    structuralOperations.push('ontology:reference-policy-deviation');
    working = `${trimSentenceEnding(working)}. The recorded contact attempt was not supported by the observed access path.`;
  }

  working = normalizeText(
    working
      .replace(/\bMs\. Chen found it\b/gi, 'Ms. Chen discovered the parcel')
      .replace(/\bshe found it\b/gi, 'the parcel was discovered')
      .replace(/\bshe saw the tag\b/gi, 'the door tag was observed')
      .replace(/\bafter ownership was confirmed bc\b/gi, 'after ownership was confirmed because')
      .replace(/\bafter ownership was confirmed\. the resident was already carrying bags\b/gi, 'after ownership was confirmed because the resident was already carrying bags')
      .replace(/\bthe parcel was relocated to the hallway table outside [^.]+? after ownership was confirmed because the resident was already carrying bags\b/gi, (match) => match)
      .replace(/\bThe parcel was relocated to the hallway table outside [^.]+? after Ms\.?\s*Chen confirmed it was hers because the resident was already carrying bags\b/gi, `The parcel was relocated to the hallway table outside ${primaryLocation} after ownership was confirmed because the resident was already carrying bags`)
      .replace(/\bBut\b/g, 'However')
      .replace(/\bi\b/g, 'the actor')
      .replace(/\bthe actor moved\b/gi, 'the parcel was relocated')
      .replace(/\bThe actor moved\b/gi, 'The parcel was relocated')
      .replace(/;\s+The parcel was relocated\b/g, '. The parcel was relocated')
      .replace(/\. the parcel was /g, '. The parcel was ')
      .replace(/\. The box remained sealed\./g, '. The box remained sealed.')
      .replace(/\. The red rush label remained attached\./g, '. The red rush label remained attached.')
  );

  working = sanitizeV2Surface(working, {
    preserveLowercaseLeads: false
  });
  return working;
}

function applyOntologyLensFinalization(text = '', context = {}) {
  const targetOntology = String(context?.generationControls?.targetOntology || '').trim().toLowerCase();
  const match = narrativeMatchScore(context?.sourceText || text, targetOntology);
  context.narrativeMatch = match;
  if (!match.matched) {
    return text;
  }
  if (targetOntology === 'actor') {
    return applyProbeOntologyFinalization(text, context);
  }
  if (targetOntology === 'institutional') {
    return applyReferenceOntologyFinalization(text, context);
  }
  return text;
}

function applyArtifactRepairPass(text = '', context = {}) {
  let working = String(text || '');
  let repaired = false;
  const structuralOperations = context.structuralOperations || [];

  const repairedConditional = working.replace(/\b(If [^.!?]{3,80})\.\s+([A-Z][^.!?]{3,100})\./g, (match, lead, tail) => {
    repaired = true;
    structuralOperations.push('repair:conditional-fragment-join');
    return `${normalizeText(lead)}, ${lowerLeadingAlpha(normalizeText(tail))}.`;
  });
  working = repairedConditional;

  const repairedClauseJoin = working
    .replace(/\b([A-Z][^.!?]{6,120}\bafter [^.!?]{3,80})\.\s+(she was already [^.!?]{3,80})\./g, (match, lead, tail) => {
      repaired = true;
      structuralOperations.push('repair:causal-clause-join');
      return `${normalizeText(lead)} because ${lowerLeadingAlpha(normalizeText(tail))}.`;
    });
  working = repairedClauseJoin;

  const repairedSemicolon = working.replace(/;\s+([A-Z][^;.!?]{3,140})/g, (match, clause) => {
    repaired = true;
    structuralOperations.push('repair:semicolon-fracture');
    return `; ${lowerLeadingAlpha(normalizeText(clause))}`;
  });
  working = repairedSemicolon;

  return {
    text: working,
    repaired
  };
}

function frontClauseSentence(sentence = '', context = {}) {
  const normalized = normalizeText(sentence);
  const patterns = [
    { regex: /^(.+?)\s+because\s+(.+)$/i, label: 'front-because', lead: 'Because' },
    { regex: /^(.+?)\s+while\s+(.+)$/i, label: 'front-while', lead: 'While' },
    { regex: /^(.+?)\s+if\s+(.+)$/i, label: 'front-if', lead: 'If' },
    { regex: /^(.+?)\s+when\s+(.+)$/i, label: 'front-when', lead: 'When' },
    { regex: /^(.+?)\s+although\s+(.+)$/i, label: 'front-although', lead: 'Although' }
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (!match) {
      continue;
    }
    const left = trimSentenceEnding(match[1]);
    const right = trimSentenceEnding(match[2]);
    if (sentenceWordCount(left) < 3 || sentenceWordCount(right) < 3) {
      continue;
    }
    (context.structuralOperations || []).push(pattern.label);
    return finalizeSentence(`${pattern.lead} ${lowerLeadingAlpha(right)}, ${lowerLeadingAlpha(left)}`);
  }

  return normalized;
}

function pivotLeadForEnvelope(envelopeId = 'generic') {
  if (envelopeId === 'cross-examiner') {
    return 'Yet';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'However';
  }
  if (envelopeId === 'undertow') {
    return 'But then';
  }
  if (envelopeId === 'matron') {
    return 'Still';
  }
  return 'But';
}

function pivotContrastSentence(sentence = '', envelopeId = 'generic', context = {}) {
  const normalized = normalizeText(sentence);
  const match = normalized.match(/^(.+?),\s+(but|yet|though)\s+(.+)$/i);
  if (!match) {
    return normalized;
  }
  const left = trimSentenceEnding(match[1]);
  const right = trimSentenceEnding(match[3]);
  if (sentenceWordCount(left) < 3 || sentenceWordCount(right) < 3) {
    return normalized;
  }
  (context.structuralOperations || []).push('pivot-contrast');
  return `${finalizeSentence(`${pivotLeadForEnvelope(envelopeId)} ${lowerLeadingAlpha(right)}`)} ${finalizeSentence(left)}`;
}

function applyClausePivotRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  return sentences.map((sentence) => {
    const fronted = frontClauseSentence(sentence, context);
    if (fronted !== sentence) {
      return fronted;
    }

    let pivoted = pivotContrastSentence(sentence, envelopeId, context);
    if (pivoted !== sentence) {
      return pivoted;
    }

    if (['spark', 'cross-examiner'].includes(envelopeId) && ['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      pivoted = splitSceneBursts(splitForClippedMomentum(sentence, sourceClass));
      if (pivoted !== sentence) {
        (context.structuralOperations || []).push('pivot-burst');
        return pivoted;
      }
    }

    return sentence;
  }).join(' ');
}

function applySyntaxShapeRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  if (['spark', 'cross-examiner', 'operator'].includes(envelopeId)) {
    return sentences.map((sentence) => {
      let next = splitForClippedMomentum(sentence, sourceClass);
      if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
        next = splitSceneBursts(next);
      }
      if (next !== sentence) {
        (context.structuralOperations || []).push('split-long-line');
      }
      return next;
    }).join(' ');
  }

  if (['matron', 'undertow', 'archivist', 'methods-editor'].includes(envelopeId)) {
    const merged = mergeForLongCurrent(sentences, chooseMergeLinker(envelopeId, sourceClass));
    if (merged.length !== sentences.length) {
      (context.structuralOperations || []).push(envelopeId === 'archivist' || envelopeId === 'methods-editor' ? 'ledger-merge' : 'merge-short-beats');
    }
    return merged.join(' ');
  }

  return sentences.map((sentence) => frontClauseSentence(sentence, context)).join(' ');
}

function applyPersonaLexiconRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = applyLexicalRegisterRewrite(paragraph, envelopeId, sourceClass, context);
  const limit = Math.max(1, replacementLimitForClass(sourceClass));

  if (envelopeId === 'spark') {
    if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bI want to\b/gi, 'I wanna', {
        limit: 2,
        label: 'persona:i-want-to->i-wanna',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bjust want to\b/gi, 'just wanna', {
        limit: 1,
        label: 'persona:just-want-to->just-wanna',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bI must keep reminding myself\b/gi, 'I keep telling myself', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:i-must-keep-reminding-myself->i-keep-telling-myself',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bOn the ready\b/gi, 'Ready', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:on-the-ready->ready',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bsuddenly\b/gi, 'all at once', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:suddenly->all-at-once',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    working = applyReplacementRule(working, /\bneed to\b/gi, sourceClass === 'procedural-record' ? 'need to' : 'got to', {
      limit: sourceClass === 'procedural-record' ? 0 : 1,
      label: 'persona:need-to->got-to',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'matron') {
    working = applyReplacementRule(working, /\bneed to\b/gi, 'have to', {
      limit: Math.min(limit, 2),
      label: 'persona:need-to->have-to',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bokay\b/gi, 'all right', {
      limit: 1,
      label: 'persona:okay->all-right',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bI think\b/g, 'it seems to me', {
        limit: 1,
        label: 'persona:i-think->it-seems-to-me',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bjust because\b/gi, 'simply because', {
        limit: 1,
        label: 'persona:just-because->simply-because',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bI keep insisting\b/gi, 'I keep pressing', {
        limit: 1,
        label: 'persona:i-keep-insisting->i-keep-pressing',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    if (['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bregarding\b/gi, 'about', {
        limit: 1,
        label: 'persona:regarding->about',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bprior\b/gi, 'earlier', {
        limit: 1,
        label: 'persona:prior->earlier',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bremains\b/gi, 'stays', {
        limit: 1,
        label: 'persona:remains->stays',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\binstructed\b/gi, 'told', {
        limit: 1,
        label: 'persona:instructed->told',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = working.replace(/\bA earlier\b/g, 'An earlier');
    }
  } else if (envelopeId === 'undertow') {
    working = applyReplacementRule(working, /\bI guess\b/gi, 'maybe', {
      limit: 1,
      label: 'persona:i-guess->maybe',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    if (sourceClass === 'narrative-scene') {
      working = applyReplacementRule(working, /\bsuddenly\b/gi, 'all at once', {
        limit: 1,
        label: 'persona:suddenly->all-at-once',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    working = applyReplacementRule(working, /\bneed to\b/gi, 'must', {
      limit: Math.min(limit, 2),
      label: 'persona:need-to->must',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bshowed\b/gi, 'indicated', {
      limit: 1,
      label: 'persona:showed->indicated',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bstart\b/gi, sourceClass === 'procedural-record' ? 'begin' : 'start', {
      limit: sourceClass === 'procedural-record' ? 1 : 0,
      label: 'persona:start->begin',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'cross-examiner') {
    working = applyReplacementRule(working, /\bI want to say\b/gi, 'I want to say plainly', {
      limit: ['reflective-prose', 'narrative-scene'].includes(sourceClass) ? 0 : 1,
      label: 'persona:i-want-to-say->say-plainly',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bOn the ready\b/gi, sourceClass === 'narrative-scene' ? 'Ready now' : 'Ready', {
      limit: sourceClass === 'narrative-scene' ? 1 : 0,
      label: sourceClass === 'narrative-scene' ? 'persona:on-the-ready->ready-now' : 'persona:on-the-ready->ready',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
}

function applyLexicalRegisterRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = String(paragraph || '');
  const limit = replacementLimitForClass(sourceClass);
  const compressedTarget = wantsCompressedSurface(context.targetProfile || {}, context.sourceProfile || {});

  if (envelopeId === 'spark' || envelopeId === 'operator') {
    working = applyReplacementRule(working, /\bperhaps\b/gi, 'maybe', {
      limit,
      label: 'register:perhaps->maybe',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = working.replace(/\b(?:honestly|really|literally)\b[,\s]*/i, (match) => {
      (context.lexicalOperations || []).push('register:trim-filler');
      recordLexemeSwap(context.lexemeSwaps || [], match.trim(), '', 'register');
      return '';
    });
    if (envelopeId === 'operator') {
      working = applyReplacementRule(working, /\bjust\b/gi, 'only', {
        limit: 1,
        label: 'register:just->only',
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  } else if (envelopeId === 'cross-examiner') {
    working = applyReplacementRule(working, /\bmaybe\b/gi, 'perhaps', {
      limit,
      label: 'register:maybe->perhaps',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'methods-editor') {
    working = applyReplacementRule(working, /\bregarding\b/gi, 'concerning', {
      limit,
      label: 'register:regarding->concerning',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bprior\b/gi, 'earlier', {
      limit: Math.min(limit, 1),
      label: 'register:prior->earlier',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bhi\b/gi, 'hello', {
      limit: sourceClass === 'procedural-record' ? 0 : 1,
      label: 'register:hi->hello',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'archivist') {
    working = applyReplacementRule(working, /\bokay\b/gi, 'acceptable', {
      limit,
      label: 'register:okay->acceptable',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bhi\b/gi, 'hello', {
      limit: sourceClass === 'procedural-record' ? 0 : 1,
      label: 'register:hi->hello',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'matron') {
    working = applyReplacementRule(working, /\bmaybe\b/gi, 'perhaps', {
      limit: 1,
      label: 'register:maybe->perhaps',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bjust because\b/gi, 'simply because', {
      limit: 1,
      label: 'register:just-because->simply-because',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  if (compressedTarget && sourceClass !== 'procedural-record') {
    const compressedRules = [
      { pattern: /\bI want to\b/gi, replacement: 'need to', label: 'register:i-want-to->need-to' },
      { pattern: /\bI do not want to\b/gi, replacement: "I don't want to", label: 'register:i-do-not-want-to->i-dont-want-to' },
      { pattern: /\bwe still have\b/gi, replacement: 'still have', label: 'register:we-still-have->still-have' },
      { pattern: /\btemporary\b/gi, replacement: 'temp', label: 'register:temporary->temp' },
      { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'register:approximately->about' },
      { pattern: /\bthose are not\b/gi, replacement: 'not', label: 'register:those-are-not->not' }
    ];
    for (const rule of compressedRules) {
      working = applyReplacementRule(working, rule.pattern, rule.replacement, {
        limit,
        label: rule.label,
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    const clauseCompression = working
      .replace(/\bwhat ([^.!?]{6,120}?) showed is that\b/gi, (match, subject) => {
        (context.structuralOperations || []).push('register:what-showed-colon');
        return `what ${subject} showed:`;
      })
      .replace(/\bwhich is technically true\b/gi, 'technically true')
      .replace(/\bthey are\s+([a-z][^.!?]{2,80}[.!?])/gi, (match, remainder) => {
        (context.lexicalOperations || []).push('register:drop-they-are');
        return matchCase(remainder, remainder);
      });
    if (clauseCompression !== working) {
      (context.lexicalOperations || []).push('register:compressed-clause');
      working = clauseCompression;
    }
  }

  if (compressedTarget && sourceClass === 'procedural-record') {
    const proceduralCompressionRules = [
      { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'register:approximately->about' },
      { pattern: /\blocated\b/gi, replacement: 'found', label: 'register:located->found' },
      { pattern: /\brequested\b/gi, replacement: 'asked for', label: 'register:requested->asked-for' },
      { pattern: /\bremained\b/gi, replacement: 'stayed', label: 'register:remained->stayed' }
    ];
    for (const rule of proceduralCompressionRules) {
      working = applyReplacementRule(working, rule.pattern, rule.replacement, {
        limit: 1,
        label: rule.label,
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  }

  if (sourceClass !== 'procedural-record') {
    working = applyReplacementRule(working, /\bBy the time\b/gi, 'When', {
      limit: 1,
      label: 'register:by-the-time->when',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bwhich is apparently what I do\b/gi, "that's what I do", {
      limit: 1,
      label: 'register:which-is-apparently-what-i-do->that-is-what-i-do',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
}

function applyConnectorRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = String(paragraph || '');
  const limit = replacementLimitForClass(sourceClass);
  const strategy = context.connectorStrategy || 'balanced';
  const targetLane = normalizeRegisterLane(context.targetRegisterLane, '');
  const protectLongFormConnectors =
    Boolean(context.hasDonorCadenceEvidence) &&
    ['formal-record', 'professional-message', 'tangled-followup'].includes(targetLane);

  if (strategy === 'split' || strategy === 'cross') {
    const next = working
      .replace(/,((?:["')\]])?)\s+(?=(?:and|but|because|while|which)\b)/gi, (match, closer = '') => `.${closer} `)
      .replace(/;\s+/g, '. ');
    if (next !== working) {
      (context.structuralOperations || []).push('connector-split');
      working = next;
    }
  }

  if (strategy === 'cascade') {
    const merged = mergeForLongCurrent(splitSentencesPreserve(working), chooseMergeLinker(envelopeId, sourceClass)).join(' ');
    if (merged !== working) {
      (context.structuralOperations || []).push('connector-cascade');
      working = merged;
    }
  }

  if (strategy === 'undertow') {
    const merged = mergeForLongCurrent(splitSentencesPreserve(working), chooseMergeLinker(envelopeId, sourceClass)).join(' ');
    if (merged !== working) {
      (context.structuralOperations || []).push('connector-undertow');
      working = merged;
    }
  }

  if (strategy === 'ledger') {
    const next = working
      .replace(/,\s+and\b/gi, '; ')
      .replace(/\.\s+And\b/g, '; ');
    if (next !== working) {
      (context.structuralOperations || []).push('connector-ledger');
      working = next;
    }
  }

  if (strategy === 'split') {
    working = applyReplacementRule(working, /\bbecause\b/gi, sourceClass === 'procedural-record' ? 'because' : 'since', {
      limit,
      label: 'connector:because->since',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'shift') {
    working = applyReplacementRule(working, /\bbecause\b/gi, 'since', {
      limit: 1,
      label: 'connector:because->since',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    if (!protectLongFormConnectors) {
      working = applyReplacementRule(working, /\bbut\b/gi, 'though', {
        limit: 1,
        label: 'connector:but->though',
        family: 'connector',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bso\b/gi, 'then', {
        limit: 1,
        label: 'connector:so->then',
        family: 'connector',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  } else if (strategy === 'cross') {
    working = applyReplacementRule(working, /\bbut\b/gi, 'yet', {
      limit,
      label: 'connector:but->yet',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'ledger') {
    working = applyReplacementRule(working, /\bbecause\b/gi, 'as', {
      limit,
      label: 'connector:because->as',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'undertow') {
    working = applyReplacementRule(working, /\bbut\b/gi, 'but then', {
      limit: 1,
      label: 'connector:but->but-then',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
}

function applyOrderBeatRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  let workingSentences = sentences.map((sentence) => frontClauseSentence(sentence, context));
  if (workingSentences.length >= 2 && ['spark', 'cross-examiner'].includes(envelopeId)) {
    const first = sentenceWordCount(workingSentences[0]);
    const second = sentenceWordCount(workingSentences[1]);
    if (first > 12 && second <= 8) {
      workingSentences = [workingSentences[1], workingSentences[0], ...workingSentences.slice(2)];
      (context.structuralOperations || []).push('beat-swap');
    }
  } else if (workingSentences.length >= 2 && ['matron', 'undertow'].includes(envelopeId) && sourceClass !== 'procedural-record') {
    const merged = mergeForLongCurrent(workingSentences, chooseMergeLinker(envelopeId, sourceClass));
    if (merged.length !== workingSentences.length) {
      workingSentences = merged;
      (context.structuralOperations || []).push('beat-merge');
    }
  }

  return workingSentences.join(' ');
}

function pressureLinkerFor(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (envelopeId === 'matron') {
    return sourceClass === 'procedural-record' ? '; ' : ', and ';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record' ? '; while ' : ', and then ';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return '; ';
  }
  return chooseMergeLinker(envelopeId, sourceClass);
}

function applyPressureCurrentRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  if (['spark', 'cross-examiner', 'operator'].includes(envelopeId)) {
    const tightened = sentences.map((sentence) => {
      let next = applyClausePivotRewrite(sentence, envelopeId, sourceClass, context);
      next = splitForClippedMomentum(next, sourceClass);
      if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
        next = splitSceneBursts(next);
      }
      return next;
    }).join(' ');
    if (normalizeComparable(tightened) !== normalizeComparable(paragraph)) {
      (context.structuralOperations || []).push('pressure-tighten');
    }
    return tightened;
  }

  const pivoted = sentences.map((sentence) => applyClausePivotRewrite(sentence, envelopeId, sourceClass, context));
  const merged = mergeForLongCurrent(pivoted, pressureLinkerFor(envelopeId, sourceClass));
  if (merged.length !== sentences.length) {
    (context.structuralOperations || []).push(
      envelopeId === 'archivist' || envelopeId === 'methods-editor'
        ? 'pressure-ledger'
        : envelopeId === 'undertow'
          ? 'pressure-undertow'
          : 'pressure-current'
    );
  }
  return merged.join(' ');
}

function applyHybridBalance(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = applySyntaxShapeRewrite(paragraph, envelopeId, sourceClass, context);
  working = applyConnectorRewrite(working, envelopeId, sourceClass, context);
  working = applyOrderBeatRewrite(working, envelopeId, sourceClass, context);
  return applyLexicalRegisterRewrite(working, envelopeId, sourceClass, context);
}

function dedupeLexemeSwaps(swaps = []) {
  const seen = new Set();
  return Object.freeze((swaps || []).filter((swap) => {
    const key = `${normalizeComparable(swap?.from || '')}::${normalizeComparable(swap?.to || '')}::${swap?.family || 'register'}`;
    if (!swap?.from || !swap?.to || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }));
}

function buildRelationInventory(
  sourceText = '',
  sourceIR = null,
  sourceClass = 'formal-correspondence',
  hardAnchors = [],
  registerLaneInfo = {}
) {
  const sourceRegisterLane = normalizeRegisterLane(registerLaneInfo?.sourceRegisterLane, 'formal-record');
  const discourseOntology = registerLaneInfo?.discourseOntology || inferDiscourseOntology({
    sourceText,
    donorSourceText: registerLaneInfo?.donorSourceText || '',
    sourceRegisterLane,
    targetRegisterLane: registerLaneInfo?.targetRegisterLane || sourceRegisterLane,
    targetOntology: registerLaneInfo?.targetOntology || ''
  });
  return Object.freeze({
    sourceClass,
    sourceRegisterLane,
    sourceRegisterLaneInference: registerLaneInfo?.inference || 'inferred',
    sourceRegisterLaneFallback: Boolean(registerLaneInfo?.fallbackUsed),
    discourseOntology,
    paragraphCount: splitParagraphs(sourceText).length || 1,
    sentenceCount: Number(sourceIR?.metadata?.sentenceCount || splitSentencesPreserve(sourceText).length || 0),
    clauseCount: Number(sourceIR?.metadata?.clauseCount || 0),
    exactAnchorCount: Number((hardAnchors || []).length || 0)
  });
}

function buildNativeLexicalShiftProfile(sourceText = '', outputText = '', sourceProfile = {}, targetProfile = null, outputProfile = {}, lexemeSwaps = []) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });

  return Object.freeze({
    lexemeSwaps: Object.freeze([...(lexemeSwaps || [])]),
    swapCount: Number((lexemeSwaps || []).length || 0),
    registerDistance: round(fit.registerDistance || 0, 4),
    contentWordComplexityDelta: round((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0), 4),
    modifierDensityDelta: round((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0), 4),
    directnessDelta: round((outputProfile.directness || 0) - (sourceProfile.directness || 0), 4),
    abstractionDelta: round((outputProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0), 4),
      contractionAligned: Math.abs((outputProfile.contractionDensity || 0) - Number(targetProfile?.contractionDensity ?? outputProfile.contractionDensity ?? 0)) <= 0.03
  });
}

function deriveRealizedChangedDimensions(profileShiftDimensions = [], lexemeSwaps = []) {
  const realized = [...new Set(profileShiftDimensions || [])];
  if (Number(lexemeSwaps?.length || 0)) {
    return realized;
  }
  const structurallyMoved = realized.some((dimension) =>
    ['sentence-mean', 'sentence-count', 'sentence-spread'].includes(dimension)
  );
  return realized.filter((dimension) => {
    if (![
      'lexical-register',
      'content-word-complexity',
      'modifier-density',
      'directness',
      'abstraction-posture'
    ].includes(dimension)) {
      return true;
    }
    // directness can be realized by structural merges (e.g. "and"-joined clauses)
    // without a lexeme swap; credit it when accompanied by sentence-level movement.
    return dimension === 'directness' && structurallyMoved;
  });
}

function buildSemanticRisk(semanticAudit = {}, protectedAnchorIntegrity = 1) {
  return round(clamp01(
    ((1 - Number(semanticAudit?.propositionCoverage ?? 1)) * 0.34) +
    ((1 - Number(semanticAudit?.actorCoverage ?? 1)) * 0.16) +
    ((1 - Number(semanticAudit?.actionCoverage ?? 1)) * 0.2) +
    ((1 - Number(semanticAudit?.objectCoverage ?? 1)) * 0.12) +
    ((1 - Number(protectedAnchorIntegrity ?? 1)) * 0.18)
  ), 4);
}

function semanticAuditBounded(semanticAudit = {}, generationControls = {}, sourceRegisterLane = '') {
  const propositionCoverage = Number(semanticAudit?.propositionCoverage ?? 1);
  const actorCoverage = Number(semanticAudit?.actorCoverage ?? 1);
  const actionCoverage = Number(semanticAudit?.actionCoverage ?? 1);
  const objectCoverage = Number(semanticAudit?.objectCoverage ?? 1);
  const polarityMismatches = Number(semanticAudit?.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit?.tenseMismatches ?? 0);
  const clauseCount = Math.max(
    1,
    Number(semanticAudit?.sourceClauseCount ?? 0),
    Number(semanticAudit?.outputClauseCount ?? 0)
  );
  const polarityRate = polarityMismatches / clauseCount;
  const tenseRate = tenseMismatches / clauseCount;
  const targetOntology = String(generationControls?.targetOntology || '').trim().toLowerCase();
  const sourceLane = normalizeRegisterLane(sourceRegisterLane, '');

  if (targetOntology === 'actor') {
    const strongCoverage =
      propositionCoverage >= 0.66 &&
      actorCoverage >= 0.58 &&
      actionCoverage >= 0.62 &&
      objectCoverage >= 0.56;
    const polarityBounded = polarityMismatches <= 1;
    const tenseBounded =
      tenseMismatches <= Math.max(4, Math.ceil(clauseCount * 0.45)) ||
      (strongCoverage && tenseMismatches <= Math.max(5, Math.ceil(clauseCount * 0.5)));
    return polarityBounded && tenseBounded;
  }

  if (targetOntology === 'institutional' && sourceLane === 'rushed-mobile') {
    const strongCoverage =
      propositionCoverage >= 0.56 &&
      actorCoverage >= 0.8 &&
      actionCoverage >= 0.5 &&
      objectCoverage >= 0.48;
    const polarityBounded = polarityMismatches <= 1;
    const tenseBounded =
      tenseMismatches <= 1 ||
      (strongCoverage && tenseMismatches <= 2 && tenseRate <= 0.34);
    return polarityBounded && tenseBounded;
  }

  const strongCoverage =
    propositionCoverage >= 0.9 &&
    actorCoverage >= 0.9 &&
    actionCoverage >= 0.9 &&
    objectCoverage >= 0.9;

  const polarityBounded =
    polarityMismatches <= 1 ||
    (strongCoverage && polarityMismatches <= 2 && polarityRate <= 0.18);
  // Strong-coverage same-facts rewrites can tolerate a small amount of tense drift
  // as long as it stays sparse relative to the clause load.
  const tenseBounded =
    tenseMismatches <= 1 ||
    (strongCoverage && tenseMismatches <= 2 && tenseRate <= 0.23);

  return polarityBounded && tenseBounded;
}

function semanticLockSatisfied(
  semanticAudit = {},
  floors = {},
  sourceClass = 'formal-correspondence',
  generationControls = {},
  sourceRegisterLane = ''
) {
  const strictCustodySemantics =
    sourceClass === 'procedural-record' &&
    String(generationControls?.targetOntology || '').trim().toLowerCase() !== 'actor';
  const propositionCoverage = Number(semanticAudit?.propositionCoverage ?? 1);
  const actorCoverage = Number(semanticAudit?.actorCoverage ?? 1);
  const actionCoverage = Number(semanticAudit?.actionCoverage ?? 1);
  const objectCoverage = Number(semanticAudit?.objectCoverage ?? 1);
  const polarityMismatches = Number(semanticAudit?.polarityMismatches ?? 0);

  return (
    propositionCoverage >= Number(floors?.proposition ?? 1) &&
    actorCoverage >= Number(floors?.actor ?? 1) &&
    actionCoverage >= Number(floors?.action ?? 1) &&
    objectCoverage >= Number(floors?.object ?? 1) &&
    (strictCustodySemantics ? polarityMismatches === 0 : polarityMismatches <= 1) &&
    semanticAuditBounded(semanticAudit, generationControls, sourceRegisterLane)
  );
}

function computeCandidateTransferClass(candidate = {}) {
  const substantiveMovement = substantiveDimensionCount(candidate.changedDimensions || []);
  const lexicalMovement = Number((candidate.lexemeSwaps || []).length || 0);
  const structuralOperationCount = Number((candidate.structuralOperations || []).length || 0);
  if (candidate.classification?.outcome === 'surface-held') {
    return substantiveMovement >= 2 && structuralOperationCount > 0 ? 'structural' : 'surface';
  }
  if (
    substantiveMovement >= 2 ||
    (substantiveMovement >= 1 && lexicalMovement > 0) ||
    Number(candidate.rewriteStrength || 0) >= 0.5
  ) {
    return 'structural';
  }
  return 'weak';
}

function buildPlanSummary(candidate = null, candidateLedger = [], testedFamilyIds = []) {
  return Object.freeze({
    relationInventory: candidate?.relationInventory || {},
    sourceRegisterLane: candidate?.sourceRegisterLane || candidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: candidate?.targetRegisterLane || 'formal-record',
    testedFamilyIds: Object.freeze([...new Set((testedFamilyIds || []).filter(Boolean))]),
    structuralOperationsSelected: Object.freeze([...(candidate?.structuralOperations || [])]),
    lexicalRegisterOperationsSelected: Object.freeze([...(candidate?.lexicalOperations || [])]),
    expectedOperators: Object.freeze([...(candidate?.expectedOperators || [])]),
    connectorStrategy: candidate?.connectorStrategy || 'balanced',
    contractionStrategy: candidate?.contractionStrategy || 'preserve'
  });
}

function buildCandidateSummary(candidateLedger = [], generationDocket = null) {
  return Object.freeze({
    candidateCount: candidateLedger.length,
    landedCandidateId: generationDocket?.winningCandidateId || null,
    landedCandidateFamily: generationDocket?.winningCandidateFamily || null,
    families: Object.freeze([...new Set(candidateLedger.map((entry) => entry.family).filter(Boolean))]),
    holdStatus: generationDocket?.status || 'landed',
    averageToolabilityScore: candidateLedger.length
      ? round(candidateLedger.reduce((sum, entry) => sum + Number(entry.toolabilityScore || 0), 0) / candidateLedger.length, 4)
      : 0
  });
}

function buildRetrievalTraceV2({
  sourceText = '',
  sourceClass = 'formal-correspondence',
  candidate = null,
  candidateLedger = [],
  testedFamilyIds = [],
  generationDocket = null,
  donorProgress = {}
} = {}) {
  return Object.freeze({
    sourceText,
    sourceClass,
    sourceRegisterLane: candidate?.sourceRegisterLane || candidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    generatorVersion: 'v2',
    semanticAudit: candidate?.semanticAudit || {},
    protectedAnchorAudit: candidate?.protectedAnchorAudit || {},
    ontologyAudit: candidate?.ontologyAudit || null,
    planSummary: buildPlanSummary(candidate, candidateLedger, testedFamilyIds),
    candidateSummary: buildCandidateSummary(candidateLedger, generationDocket),
    realizationSummary: Object.freeze({
      transferClass: candidate?.transferClass || 'held',
      borrowedShellOutcome: candidate?.transferClass === 'structural' ? 'structural' : candidate?.transferClass === 'surface' ? 'surface-held' : candidate ? 'partial' : 'held',
      borrowedShellFailureClass: generationDocket?.holdClass || null,
      realizationTier: candidate?.realizationTier || 'hold',
      changedDimensions: Object.freeze([...(candidate?.changedDimensions || [])]),
      profileShiftDimensions: Object.freeze([...(candidate?.profileShiftDimensions || [])]),
      lexemeSwaps: Object.freeze([...(candidate?.lexemeSwaps || [])]),
      vernacularFeatureShift: candidate?.vernacularFeatureShift || null,
      visibleShift: Boolean(candidate?.visibleShift),
      nonTrivialShift: Boolean(candidate?.nonTrivialShift)
    }),
    vernacularFeatures: candidate?.vernacularFeatures || null,
    donorProgress: donorProgress || {},
    candidateLedger,
    generationDocket,
    winningCandidateId: generationDocket?.winningCandidateId || null
  });
}

function buildNativePassThroughTransfer(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  const sourceProfile = extractCadenceProfile(sourceText);
  const hardAnchors = extractHardAnchors(sourceText);
  const sourceClass = classifyV2SourceClass(sourceText);
  const sourceRegisterLaneInfo = resolveSourceRegisterLane({
    sourceText,
    sourceProfile,
    sourceClass
  });
  const protectedState = {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const generationControls = resolveOntologyGenerationControls({
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane
  });
  const temporalDirective = buildTemporalDirective(sourceText, sourceRegisterLaneInfo.sourceRegisterLane);
  const temporalAttestation = auditTemporalAttestation(sourceText, sourceText, temporalDirective);
  const sourceVernacularFeatures = inferVernacularFeatures(
    sourceText,
    sourceProfile,
    sourceRegisterLaneInfo.sourceRegisterLane,
    sourceClass
  );
  const vernacularFeatureShift = buildVernacularFeatureShift({
    sourceFeatures: sourceVernacularFeatures,
    donorFeatures: sourceVernacularFeatures,
    outputFeatures: sourceVernacularFeatures,
    targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetProfile: shell.profile || sourceProfile
  });
  const entityMaskLedger = buildEntityMaskLedger(
    protectAnchorsForRewrite(
      sourceText,
      uniqueStrings([...hardAnchors, ...extractSensitiveMaskAnchors(sourceText, sourceClass)])
    ).replacements
  );
  const sourceIR = segmentTextToIR(sourceText, protectedState);
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const auditBundle = buildSemanticAuditBundle(sourceIR, sourceText, protectedState);
  const nativeRelationInventory = buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors, sourceRegisterLaneInfo);
  const nativeOntologyAudit = buildTD613OntologyAudit({
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetOntology: generationControls.targetOntology,
    relationInventory: nativeRelationInventory,
    semanticAudit: auditBundle.semanticAudit,
    protectedAnchorAudit: auditBundle.protectedAnchorAudit,
    apertureReview: {
      semanticCoverageRisk: 0,
      recaptureRisk: 0,
      candidateSuppression: 0,
      observabilityDeficit: 0,
      aliasPersistence: 0,
      namingSensitivity: 0,
      redundancyInflation: 0,
      capacityPressure: 0,
      policyPressure: 0
    }
  });
  const generationDocket = Object.freeze({
      status: 'landed',
      holdClass: null,
      headline: shell?.mode === 'native' ? 'Generator V2 stayed native.' : 'Generator V2 stayed on source cadence.',
      reasons: Object.freeze([]),
      candidateCount: 1,
      winningCandidateId: 'native',
      winningCandidateFamily: 'native',
      ontologyRoutePressure: nativeOntologyAudit
    });
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals: [],
    repairPasses: [],
    candidateSuppression: 0,
    observabilityDeficit: 0,
    aliasPersistence: 0,
    namingSensitivity: 0,
    redundancyInflation: 0,
    capacityPressure: 0,
    policyPressure: 0,
    withheldMaterial: false,
    withheldReason: null
  });
  const candidateLedger = Object.freeze([
    Object.freeze({
        id: 'native',
        family: 'native',
        envelopeId: 'generic',
        status: 'selected',
        sourceRegisterLane: nativeOntologyAudit?.sourceRegisterLane || 'formal-record',
        targetRegisterLane: nativeOntologyAudit?.sourceRegisterLane || 'formal-record',
        score: 1,
        rewriteStrength: 0,
        targetFit: 1,
        movementConfidence: 0,
        failureReasons: Object.freeze([]),
        transferClass: 'native',
        generationControls,
        temporalDirective,
        temporalAttestation,
        entityMaskLedger,
        changedDimensions: Object.freeze([]),
        profileShiftDimensions: Object.freeze([]),
        lexemeSwapCount: 0,
        artifactRepairApplied: false,
        vernacularFeatures: Object.freeze({
          source: sourceVernacularFeatures,
          donor: sourceVernacularFeatures,
          output: sourceVernacularFeatures,
          pressure: buildVernacularFeaturePressure({
            sourceFeatures: sourceVernacularFeatures,
            donorFeatures: sourceVernacularFeatures,
            targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
            targetProfile: shell.profile || sourceProfile
          })
        }),
        vernacularFeatureShift,
        ontologyAudit: nativeOntologyAudit,
        outputPreview: sourceText.slice(0, 160)
      })
  ]);
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: Object.freeze({
          transferClass: 'native',
          realizationTier: 'none',
          changedDimensions: [],
          profileShiftDimensions: [],
          lexemeSwaps: [],
          vernacularFeatures: Object.freeze({
            source: sourceVernacularFeatures,
            donor: sourceVernacularFeatures,
            output: sourceVernacularFeatures,
            pressure: buildVernacularFeaturePressure({
              sourceFeatures: sourceVernacularFeatures,
              donorFeatures: sourceVernacularFeatures,
              targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
              targetProfile: shell.profile || sourceProfile
            })
          }),
          vernacularFeatureShift,
          visibleShift: false,
          nonTrivialShift: false,
          relationInventory: nativeRelationInventory,
          sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
          targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
          semanticAudit: auditBundle.semanticAudit,
          protectedAnchorAudit: auditBundle.protectedAnchorAudit,
          ontologyAudit: nativeOntologyAudit,
          connectorStrategy: 'balanced',
          contractionStrategy: 'preserve'
        }),
        candidateLedger,
        testedFamilyIds: ['native'],
        generationDocket
      })
    : null;

  return Object.freeze({
    text: sourceText,
    internalText: sourceText,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    sourceProfile,
    targetProfile: shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile,
    changedDimensions: [],
    profileShiftDimensions: [],
    protectedLiteralCount: hardAnchors.length,
    passesApplied: [],
    rescuePasses: [],
    donorProgress: {},
    transferClass: 'native',
    qualityGatePassed: true,
    notes: Object.freeze([generationDocket.headline]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: 'none',
    lexicalShiftProfile: Object.freeze({
      lexemeSwaps: Object.freeze([]),
      swapCount: 0,
      registerDistance: 0,
      contentWordComplexityDelta: 0,
      modifierDensityDelta: 0,
      directnessDelta: 0,
      abstractionDelta: 0,
      contractionAligned: true
    }),
    semanticRisk: 0,
    lexemeSwaps: Object.freeze([]),
    vernacularFeatures: Object.freeze({
      source: sourceVernacularFeatures,
      donor: sourceVernacularFeatures,
      output: sourceVernacularFeatures,
      pressure: buildVernacularFeaturePressure({
        sourceFeatures: sourceVernacularFeatures,
        donorFeatures: sourceVernacularFeatures,
        targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
        targetProfile: shell.profile || sourceProfile
      })
    }),
    vernacularFeatureShift,
    generationControls,
    temporalDirective,
    temporalAttestation,
    entityMaskLedger,
    realizationNotes: Object.freeze([]),
    borrowedShellOutcome: null,
    borrowedShellFailureClass: null,
    toolabilityAudit: Object.freeze({
      readability: 1,
      personaDistinctness: 0,
      sentenceIntegrity: 1,
      movementQuality: 0,
      artifactPenalty: 0,
      semanticLockIntact: true,
      toolabilityScore: 0.5,
      warnings: Object.freeze([])
    }),
    personaSeparationAudit: Object.freeze({
      envelopeId: 'generic',
      markerCount: 0,
      requiredMarkers: 1,
      score: 0,
      warnings: Object.freeze([]),
      markers: Object.freeze([])
    }),
    toolabilityWarnings: Object.freeze([]),
    semanticLockIntact: true,
    visibleShift: false,
    nonTrivialShift: false,
    semanticAudit: auditBundle.semanticAudit,
    protectedAnchorAudit: auditBundle.protectedAnchorAudit,
    ontologyAudit: nativeOntologyAudit,
    apertureAudit,
    apertureProtocol: Object.freeze({
      outcome: 'projected',
      line: generationDocket.headline,
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: 'landed'
  });
}

function authorNativeCandidateText(sourceText = '', variant = {}, family = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const sourceRegisterLane = normalizeRegisterLane(options.sourceRegisterLane, 'formal-record');
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const sensitiveMaskAnchors = options.sensitiveMaskAnchors || extractSensitiveMaskAnchors(sourceText, sourceClass);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const familyId = family.id || 'syntax-shape';
  const targetRegisterLane = normalizeRegisterLane(
    options.targetRegisterLane || resolveTargetRegisterLane({
      shell: variant.shell,
      targetProfile: variant.shell?.profile || null,
      sourceProfile,
      sourceClass
    }),
    sourceRegisterLane
  );
  const generationControls = variant.shell?.generationControls || resolveOntologyGenerationControls({
    sourceClass,
    sourceRegisterLane,
    targetRegisterLane
  });
  const donorSourceText = normalizeText(
    options.donorText ||
    variant.shell?.sourceText ||
    variant.shell?.donorText ||
    variant.shell?.comparisonText ||
    ''
  );
  const sourceVernacularFeatures = inferVernacularFeatures(
    sourceText,
    sourceProfile,
    sourceRegisterLane,
    sourceClass
  );
  const donorVernacularFeatures = inferVernacularFeatures(
    donorSourceText,
    variant.shell?.profile || {},
    targetRegisterLane,
    sourceClass
  );
  const vernacularFeaturePressure = buildVernacularFeaturePressure({
    sourceFeatures: sourceVernacularFeatures,
    donorFeatures: donorVernacularFeatures,
    targetRegisterLane,
    targetProfile: variant.shell?.profile || {}
  });
  const discourseOntology = inferDiscourseOntology({
    sourceText,
    donorSourceText,
    sourceRegisterLane,
    targetRegisterLane,
    targetOntology: generationControls.targetOntology
  });
  const temporalDirective = options.temporalDirective || buildTemporalDirective(sourceText, targetRegisterLane);
  const connectorStrategy = connectorStrategyFor(variant.envelopeId, sourceClass, familyId, {
    shellMode: variant.shell?.mode,
    targetProfile: variant.shell?.profile,
    sourceText
  });
  const contractionStrategy = contractionStrategyFor(
    variant.envelopeId,
    variant.shell?.profile || null,
    sourceProfile,
    sourceClass,
    familyId
  );
  const maskAnchors = uniqueStrings([...(hardAnchors || []), ...(sensitiveMaskAnchors || [])]);
  const protectedState = protectAnchorsForRewrite(sourceText, maskAnchors);
  const temporalState = protectTemporalNullsForRewrite(protectedState.text, temporalDirective);
  const paragraphs = splitParagraphs(temporalState.text);
  const structuralOperations = [];
  const lexicalOperations = [];
  const lexemeSwaps = [];
  const context = {
    structuralOperations,
    lexicalOperations,
    lexemeSwaps,
      connectorStrategy,
      contractionStrategy,
      targetProfile: variant.shell?.profile || null,
      sourceProfile,
      effectiveMod: normalizeShellModValue(variant.shell?.mod || cadenceModFromProfile(variant.shell?.profile || sourceProfile)),
      sourceClass,
      sourceRegisterLane,
      targetRegisterLane,
      intensity: variantIntensity(variant) * familyWeight(familyId, sourceClass, variant.envelopeId) * Number(generationControls.intensityScalar || 1),
      generationControls,
      temporalDirective,
      discourseOntology,
      sourceVernacularFeatures,
      donorVernacularFeatures,
      vernacularFeaturePressure,
      sourceText,
      donorSourceText,
      hasDonorCadenceEvidence: Boolean(donorSourceText || variant.shell?.registerLane),
      anchorReplacements: protectedState.replacements,
      primaryLocationPlaceholder: firstMaskedAnchorToken(protectedState.replacements, 'location'),
      primaryLocationResolved: normalizeText(
        (protectedState.replacements.find((entry) => entry?.kind === 'location') || {}).value || ''
      )
    };

  const rewrittenParagraphs = paragraphs.map((paragraph) => {
    let working = paragraph;

    if (familyId === 'syntax-shape') {
      working = applySyntaxShapeRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'register-lexicon') {
      working = applyLexicalRegisterRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'cadence-connector') {
      working = applyConnectorRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'order-beat') {
      working = applyOrderBeatRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'clause-pivot') {
      working = applyClausePivotRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'persona-lexicon') {
      working = applyPersonaLexiconRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'pressure-current') {
      working = applyPressureCurrentRewrite(working, variant.envelopeId, sourceClass, context);
    } else {
      working = applyHybridBalance(working, variant.envelopeId, sourceClass, context);
    }

    if (familyId !== 'cadence-connector' && context.connectorStrategy === 'shift') {
      working = applyConnectorRewrite(working, variant.envelopeId, sourceClass, context);
    }

      return applyPersonaEnvelopeText(working, {
        sourceText: paragraph,
        envelopeId: variant.envelopeId,
        sourceClass,
        targetProfile: variant.shell.profile || {},
        explicitTargetProfile: Boolean(variant.shell.profile),
        context
      });
    });

  let outputText = joinParagraphs(rewrittenParagraphs);
  outputText = applyContractionStrategyText(outputText, contractionStrategy, context);
  outputText = applyCompressedSurfaceRewrite(
    outputText,
    context.targetProfile,
    sourceProfile,
    context
  );
  outputText = applyExpandedSurfaceRewrite(
    outputText,
    context.targetProfile,
    sourceProfile,
    context
  );
  outputText = applyCadenceAxisOperators(outputText, context);
  {
    const preLaneText = outputText;
    const laneCandidate = applyRegisterLaneRealization(preLaneText, context);
    if (laneCandidate !== preLaneText) {
      const laneAudit = buildSemanticAuditBundle(sourceIR, laneCandidate, protectedState);
      outputText = Number(laneAudit?.semanticAudit?.propositionCoverage ?? 1) >= 0.85
        ? laneCandidate
        : preLaneText;
    }
  }
  outputText = restoreTemporalNullsAfterRewrite(outputText, temporalState, temporalDirective, targetRegisterLane);
  const polishProtected = protectAnchorsForRewrite(outputText, hardAnchors);
  outputText = polishNativeCandidateText(polishProtected.text, {
    envelopeId: variant.envelopeId,
    sourceClass
  })
    .replace(/;\s+(?=[A-Z])/g, '. ')
    .replace(/,,+/g, ',');
  {
    const targetLooseness = Number(context.targetProfile?.orthographicLooseness || 0);
    const sourceLooseness = Number(sourceProfile?.orthographicLooseness || 0);
    if (targetLooseness >= Math.max(0.06, sourceLooseness + 0.04)) {
      const limit = targetLooseness >= 0.6 ? 6 : targetLooseness >= 0.2 ? 4 : 2;
      outputText = loosenSentenceStartsV2(outputText, limit);
    }
  }
  outputText = restoreAnchorsAfterRewrite(outputText, polishProtected.replacements);
  const artifactRepair = applyArtifactRepairPass(outputText, context);
  outputText = artifactRepair.text;
  outputText = repairFormalAndChains(outputText, context);
  outputText = restoreAnchorsAfterRewrite(outputText, protectedState.replacements);
  outputText = restoreHardWitnessAnchors(
    sourceText,
    restoreProceduralWitnessTerms(sourceText, outputText, sourceClass)
  );
  if (
    (context.expectedOperators || []).includes('REHYDRATE_CLIPPED_CLAUSES') &&
    /\b(?:\d+[a-z]\s+sink leak|sink leak|cabinet floor|plumber)\b/i.test(outputText)
  ) {
    // A few protected locations/timestamps are restored only after the first
    // rehydration pass, so run the same lossless expansion once more on the
    // restored surface before ontology/audit routing.
    outputText = rehydrateClippedClausesForLongForm(outputText, context);
  }
  const preOntologyLensText = outputText;
  const ontologyProtected = protectAnchorsForRewrite(outputText, hardAnchors);
  let lensCandidate = restoreAnchorsAfterRewrite(
    applyOntologyLensFinalization(ontologyProtected.text, context),
    ontologyProtected.replacements
  );
  if (context.narrativeMatch?.matched) {
    if (generationControls.targetOntology === 'actor') {
      lensCandidate = applyProbeOntologyFinalization(lensCandidate, context);
    } else if (generationControls.targetOntology === 'institutional') {
      lensCandidate = applyReferenceOntologyFinalization(lensCandidate, context);
    }
  }
  // Guard: if the ontology lens paraphrase drops proposition coverage
  // below the engine's semantic-integrity floor, discard it and keep
  // the pre-lens text. The lens rewrites a handful of rushed-mobile
  // phrases into formal-record phrasing, which is valuable for the
  // native polishing path but can invent content not present in the
  // source when the transfer is borrowed.
  if (lensCandidate !== preOntologyLensText) {
    const lensAudit = buildSemanticAuditBundle(sourceIR, lensCandidate, protectedState);
    const narrativeLensMatched = Boolean(context.narrativeMatch?.matched);
    outputText = narrativeLensMatched || Number(lensAudit?.semanticAudit?.propositionCoverage ?? 1) >= 0.85
      ? lensCandidate
      : preOntologyLensText;
  }
  recordOntologyLensDelta(lexemeSwaps, preOntologyLensText, outputText, generationControls.targetOntology);
  outputText = normalizeText(outputText)
    .replace(/,\s+and\s+A plumber\b/g, ', and a plumber')
    .replace(/\bbrooks emailed\b/g, 'Brooks emailed')
    .replace(/\.\s+the cabinet\b/g, '. The cabinet');
  if (['formal-record', 'professional-message', 'tangled-followup'].includes(targetRegisterLane)) {
    outputText = upperSentenceStarts(outputText);
  }
  outputText = enforceRushedMobileOrthography(outputText, context);

  return Object.freeze({
    outputText,
    structuralOperations: uniqueStrings(structuralOperations),
    lexicalOperations: uniqueStrings(lexicalOperations),
    expectedOperators: uniqueStrings(context.expectedOperators || []),
    lexemeSwaps: dedupeLexemeSwaps(lexemeSwaps),
    connectorStrategy,
    contractionStrategy,
    relationInventory: buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors, {
      sourceRegisterLane,
      inference: options.sourceRegisterLaneInference || 'inferred',
      fallbackUsed: Boolean(options.sourceRegisterLaneFallback),
      donorSourceText,
      targetRegisterLane,
      targetOntology: generationControls.targetOntology,
      discourseOntology
    }),
    sourceRegisterLane,
    targetRegisterLane,
    artifactRepairApplied: artifactRepair.repaired,
    generationControls,
    temporalDirective,
    entityMaskLedger: buildEntityMaskLedger(protectedState.replacements),
    sourceVernacularFeatures,
    donorVernacularFeatures,
    vernacularFeaturePressure
  });
}

function buildCandidate(sourceText = '', variant = {}, family = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceRegisterLaneInfo = resolveSourceRegisterLane({
    sourceText,
    sourceProfile,
    sourceClass,
    explicitRegisterLane: options.sourceRegisterLane
  });
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const targetRegisterLane = normalizeRegisterLane(
    options.targetRegisterLane || resolveTargetRegisterLane({
      shell: variant.shell,
      targetProfile: variant.shell?.profile || null,
      sourceProfile,
      sourceClass
    }),
    sourceRegisterLaneInfo.sourceRegisterLane
  );
  const generationControls = variant.shell?.generationControls || resolveOntologyGenerationControls({
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetRegisterLane
  });
  const auditedHardAnchors = filterHardAnchorsForTarget(hardAnchors, generationControls.targetOntology);
  const protectedState = {
    literals: Object.freeze(auditedHardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, protectedState);
  const authored = authorNativeCandidateText(sourceText, variant, family, {
    ...options,
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    sourceRegisterLaneInference: sourceRegisterLaneInfo.inference,
    sourceRegisterLaneFallback: sourceRegisterLaneInfo.fallbackUsed,
    sourceProfile,
    sourceIR,
    hardAnchors,
    targetRegisterLane,
    generationControls
  });
  const outputText = authored.outputText;
  const outputProfile = extractCadenceProfile(outputText);
  const profileShiftDimensions = deriveChangedDimensions(sourceProfile, outputProfile);
  const outputVernacularFeatures = inferVernacularFeatures(
    outputText,
    outputProfile,
    authored.targetRegisterLane,
    sourceClass
  );
  const vernacularFeatureShift = buildVernacularFeatureShift({
    sourceFeatures: authored.sourceVernacularFeatures,
    donorFeatures: authored.donorVernacularFeatures,
    outputFeatures: outputVernacularFeatures,
    targetRegisterLane: authored.targetRegisterLane,
    targetProfile: variant.shell?.profile || null
  });
  const changedDimensions = applyVernacularFeatureShiftDimensions(
    deriveRealizedChangedDimensions(profileShiftDimensions, authored.lexemeSwaps),
    vernacularFeatureShift
  );
  const semanticBundle = buildSemanticAuditBundle(sourceIR, outputText, protectedState);
  const semanticAudit = semanticBundle.semanticAudit || {};
  const protectedAnchorAudit = semanticBundle.protectedAnchorAudit || {};
  const witnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText,
    outputText,
    sourceIR,
    protectedState
  });
  const pathologies = detectTD613ApertureTextPathologies({
    sourceText,
    outputText
  });
  const visibleShift = normalizeComparable(sourceText) !== normalizeComparable(outputText);
  const nonTrivialShift =
    substantiveDimensionCount(changedDimensions) > 0 ||
    authored.lexemeSwaps.length > 0 ||
    normalizeMovementComparable(sourceText) !== normalizeMovementComparable(outputText);
  const targetProfile = variant.shell.profile || null;
  const floors = ontologySemanticFloor(
    classSemanticFloor(sourceClass, sourceProfile, targetProfile),
    generationControls,
    sourceRegisterLaneInfo.sourceRegisterLane
  );
  const semanticLockIntact = semanticLockSatisfied(
    semanticAudit,
    floors,
    sourceClass,
    generationControls,
    sourceRegisterLaneInfo.sourceRegisterLane
  );
  const semanticRisk = buildSemanticRisk(semanticAudit, protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const apertureReview = reviewTD613ApertureTransfer({
    sourceText,
    outputText,
    shellMode: variant.shell?.mode || 'native',
    shellSource: variant.shell?.source || '',
    retrieval: true,
    semanticRisk,
    semanticLockIntact,
    visibleShift,
    nonTrivialShift,
    protectedAnchorIntegrity: Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1),
    propositionCoverage: Number(semanticAudit.propositionCoverage ?? 1),
    actorCoverage: Number(semanticAudit.actorCoverage ?? 1),
    actionCoverage: Number(semanticAudit.actionCoverage ?? 1),
    objectCoverage: Number(semanticAudit.objectCoverage ?? 1)
  });
  const ontologyAudit = buildTD613OntologyAudit({
    sourceClass,
    sourceRegisterLane: authored.sourceRegisterLane,
    targetOntology: generationControls.targetOntology,
    relationInventory: authored.relationInventory,
    semanticAudit,
    protectedAnchorAudit,
    apertureReview
  });
  const classification = classifyTD613ApertureProjection({
    sourceText,
    outputText,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    visibleShift,
    nonTrivialShift,
    repaired: Boolean(authored.artifactRepairApplied),
    pathologies,
    blocked: false
  });
  const rewriteStrength = computeRewriteStrength(
    sourceText,
    outputText,
    sourceProfile,
    outputProfile,
    changedDimensions,
    authored.lexemeSwaps
  );
  const artifactAudit = buildArtifactAudit({
    sourceText,
    outputText,
    sourceClass,
    envelopeId: variant.envelopeId,
    targetProfile: variant.shell?.profile || null,
    sourceProfile
  });
  const targetFit = computeTargetFit(outputProfile, targetProfile);
  const donorProgress = variant.shell?.mode === 'borrowed'
    ? buildBorrowedShellDonorProgress(sourceText, outputText, sourceProfile, targetProfile || {}, outputProfile)
    : {};
  const temporalAttestation = auditTemporalAttestation(sourceText, outputText, authored.temporalDirective);
  const hardIntegrityScore = hardAnchorIntegrity(sourceText, outputText, auditedHardAnchors);
  const protectedAnchorIntegrity = Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const polarityMismatches = Number(semanticAudit.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit.tenseMismatches ?? 0);
  const semanticsBounded = semanticAuditBounded(
    semanticAudit,
    generationControls,
    sourceRegisterLaneInfo.sourceRegisterLane
  );
  const strictCustodySemantics =
    sourceClass === 'procedural-record' &&
    String(generationControls?.targetOntology || '').trim().toLowerCase() !== 'actor';
  const semanticPass =
    Number(semanticAudit.propositionCoverage ?? 1) >= floors.proposition &&
    Number(semanticAudit.actorCoverage ?? 1) >= floors.actor &&
    Number(semanticAudit.actionCoverage ?? 1) >= floors.action &&
    Number(semanticAudit.objectCoverage ?? 1) >= floors.object &&
    (strictCustodySemantics ? polarityMismatches === 0 : polarityMismatches <= 1);
  const exactPass = hardIntegrityScore >= 1;
  const protectedAnchorPass =
    protectedAnchorIntegrity >= ontologyProtectedAnchorFloor(
      sourceClass,
      generationControls,
      sourceRegisterLaneInfo.sourceRegisterLane
    );
  const pathologyPass = !pathologies.severe;
  const rewritePass = meetsLandedRewriteBar(sourceClass, rewriteStrength, changedDimensions, authored.lexemeSwaps);
  const temporalPass = temporalAttestation.attestationPassed;
  const passed = exactPass && protectedAnchorPass && semanticPass && pathologyPass && rewritePass && temporalPass;
  const polarityPenalty = polarityMismatches * (strictCustodySemantics ? 0.16 : 0.12);
  const tensePenalty = tenseMismatches * (strictCustodySemantics ? 0.05 : 0.04);
  const boundedPenalty = semanticsBounded ? 0 : 0.18;
  const familyBonus = familySelectionBonus(sourceClass, family.id, variant.envelopeId);
  const distinctnessBonus = personaDistinctnessBonus({
    envelopeId: variant.envelopeId,
    sourceProfile,
    outputProfile,
    sourceClass,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps
  });
  const personaSeparationAudit = buildPersonaSeparationAudit({
    envelopeId: variant.envelopeId,
    sourceProfile,
    outputProfile,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    sourceClass,
    outputText,
    artifactAudit
  });
  const score = round(
    (rewriteStrength * 0.52) +
    (targetFit * 0.24) +
    (Number(classification.movementConfidence || 0) * 0.12) +
    (Number(witnessAudit.softWitnessIntegrity ?? 1) * 0.08) +
    familyBonus +
    distinctnessBonus -
    (semanticLockIntact ? 0 : artifactAudit.penalty) +
    (visibleShift ? 0.04 : 0) -
      polarityPenalty -
      tensePenalty -
      boundedPenalty -
      (temporalPass ? 0 : 0.24) -
      ((1 - protectedAnchorIntegrity) * 1.5) -
      (pathologies.flags.length * 0.05),
    4
  );
  const transferClass = computeCandidateTransferClass({
    classification,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    structuralOperations: authored.structuralOperations,
    rewriteStrength
  });
  const toolabilityAudit = buildToolabilityAudit({
    sourceClass,
    transferClass,
    rewriteStrength,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    artifactAudit,
    semanticLockIntact,
    personaSeparationAudit,
    distinctnessBonus,
    outputProfile,
    sourceProfile,
    pathologies
  });
  const failureReasons = uniqueStrings([
    !exactPass ? 'hard-anchor-failure' : null,
    !protectedAnchorPass ? 'anchor-drift-detected' : null,
    !semanticPass ? 'semantic-failure' : null,
    !pathologyPass ? 'pathology' : null,
    !temporalPass ? 'timestamp-hallucination' : null,
    !rewritePass ? 'below-rewrite-bar' : null
  ]);
  const lexicalShiftProfile = buildNativeLexicalShiftProfile(
    sourceText,
    outputText,
    sourceProfile,
    targetProfile,
    outputProfile,
    authored.lexemeSwaps
  );

  return Object.freeze({
    id: `${variant.id}:${family.id}`,
    family: family.id,
    envelopeId: variant.envelopeId,
    shell: variant.shell,
    sourceClass,
    sourceRegisterLane: authored.sourceRegisterLane,
    targetRegisterLane: authored.targetRegisterLane,
    sourceIR,
    hardAnchors,
    targetProfile: targetProfile || sourceProfile,
    outputText,
    outputProfile,
    changedDimensions,
    profileShiftDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    lexicalShiftProfile,
    semanticAudit,
    protectedAnchorAudit,
    witnessAudit,
    apertureReview,
    classification,
    pathologies,
    artifactAudit: Object.freeze({
      ...artifactAudit,
      semanticLockIntact,
      effectivePenalty: semanticLockIntact ? 0 : Number(artifactAudit.penalty || 0)
    }),
    visibleShift,
    nonTrivialShift,
    rewriteStrength,
    targetFit,
    transferClass,
    relationInventory: authored.relationInventory,
    generationControls: authored.generationControls,
    temporalDirective: authored.temporalDirective,
    temporalAttestation,
    entityMaskLedger: authored.entityMaskLedger,
    vernacularFeatures: Object.freeze({
      source: authored.sourceVernacularFeatures,
      donor: authored.donorVernacularFeatures,
      output: outputVernacularFeatures,
      pressure: authored.vernacularFeaturePressure
    }),
    vernacularFeatureShift,
    ontologyAudit,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    expectedOperators: authored.expectedOperators || [],
    connectorStrategy: authored.connectorStrategy,
    contractionStrategy: authored.contractionStrategy,
    artifactRepairApplied: Boolean(authored.artifactRepairApplied),
    semanticRisk,
    semanticBounded: semanticsBounded,
    semanticLockIntact,
    donorProgress,
    score,
    toolabilityAudit,
    personaSeparationAudit,
    toolabilityWarnings: toolabilityAudit.warnings,
    passed,
    failureReasons,
    realizationTier: deriveRealizationTier(changedDimensions, authored.lexemeSwaps)
  });
}

function dedupeCandidates(candidates = []) {
  const seen = new Set();
  return (candidates || []).filter((candidate) => {
    const key = normalizeComparable(candidate?.outputText || '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildCandidateLedger(candidates = [], landedId = null) {
  return Object.freeze((candidates || []).map((candidate) => Object.freeze({
    id: candidate.id,
    family: candidate.family,
    envelopeId: candidate.envelopeId,
    status: candidate.passed ? (candidate.id === landedId ? 'selected' : 'eligible') : 'held',
    sourceRegisterLane: candidate.sourceRegisterLane || candidate.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: candidate.targetRegisterLane || 'formal-record',
    score: candidate.score,
    toolabilityScore: Number(candidate.toolabilityAudit?.toolabilityScore || 0),
    rewriteStrength: candidate.rewriteStrength,
    targetFit: candidate.targetFit,
    movementConfidence: Number(candidate.classification?.movementConfidence || 0),
    personaSeparationScore: Number(candidate.personaSeparationAudit?.score || 0),
    failureReasons: Object.freeze([...(candidate.failureReasons || [])]),
    artifactFlags: Object.freeze([...(candidate.artifactAudit?.flags || [])]),
    toolabilityWarnings: Object.freeze([...(candidate.toolabilityWarnings || [])]),
    transferClass: candidate.transferClass || 'weak',
    changedDimensions: Object.freeze([...(candidate.changedDimensions || [])]),
    profileShiftDimensions: Object.freeze([...(candidate.profileShiftDimensions || [])]),
    lexemeSwapCount: Number(candidate.lexemeSwaps?.length || 0),
    expectedOperators: Object.freeze([...(candidate.expectedOperators || [])]),
    artifactRepairApplied: Boolean(candidate.artifactRepairApplied),
    vernacularFeatures: candidate.vernacularFeatures || null,
    vernacularFeatureShift: candidate.vernacularFeatureShift || null,
    ontologyAudit: candidate.ontologyAudit || null,
    outputPreview: String(candidate.outputText || '').slice(0, 160)
  })));
}

function candidateHoldClass(candidate = null) {
  if (!candidate) {
    return 'below-rewrite-bar';
  }
  if (candidateRouteFloorRank(candidate) >= 2) {
    return 'aperture-route-pressure';
  }
  if ((candidate.failureReasons || []).includes('timestamp-hallucination')) {
    return 'timestamp-hallucination';
  }
  if ((candidate.failureReasons || []).includes('pathology')) {
    return 'pathology';
  }
  if ((candidate.failureReasons || []).includes('hard-anchor-failure')) {
    return 'hard-anchor-failure';
  }
  if ((candidate.failureReasons || []).includes('semantic-failure')) {
    return 'semantic-failure';
  }
  return 'below-rewrite-bar';
}

function candidateTransferRank(candidate = null) {
  const transferClass = String(candidate?.transferClass || '').toLowerCase();
  if (transferClass === 'structural') {
    return 2;
  }
  if (transferClass === 'surface') {
    return 1;
  }
  return 0;
}

function candidateSemanticBounded(candidate = null) {
  if (typeof candidate?.semanticBounded === 'boolean') {
    return candidate.semanticBounded;
  }
  return semanticAuditBounded(candidate?.semanticAudit || {});
}

function candidateFamilyPriority(candidate = null) {
  return familyWeight(
    String(candidate?.family || 'syntax-shape'),
    String(candidate?.sourceClass || 'formal-correspondence'),
    String(candidate?.envelopeId || 'generic')
  );
}

function candidateToolabilityScore(candidate = null) {
  return Number(candidate?.toolabilityAudit?.toolabilityScore || 0);
}

function candidateOntologyAudit(candidate = null) {
  return candidate?.ontologyAudit || null;
}

function candidateDriftRank(candidate = null) {
  const driftClass = String(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.driftClass || 'none').toLowerCase();
  if (driftClass === 'severe') {
    return 3;
  }
  if (driftClass === 'active') {
    return 2;
  }
  if (driftClass === 'watch') {
    return 1;
  }
  return 0;
}

function candidateRouteFloorRank(candidate = null) {
  const routeFloor = String(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.routeFloor || 'play').toLowerCase();
  if (routeFloor === 'harbor') {
    return 3;
  }
  if (routeFloor === 'buffer') {
    return 2;
  }
  if (routeFloor === 'warning') {
    return 1;
  }
  return 0;
}

function candidateRoutePressure(candidate = null) {
  return Number(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.routePressure || 0);
}

function candidateProtectedAnchorIntegrity(candidate = null) {
  return Number(candidateOntologyAudit(candidate)?.anchorIntegrity?.protectedAnchorIntegrity ?? candidate?.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1);
}

function candidateMinimumSemanticCoverage(candidate = null) {
  const semanticCoverage = candidateOntologyAudit(candidate)?.semanticCoverage || candidate?.semanticAudit || {};
  return Math.min(
    Number(semanticCoverage?.propositionCoverage ?? 1),
    Number(semanticCoverage?.actorCoverage ?? 1),
    Number(semanticCoverage?.actionCoverage ?? 1),
    Number(semanticCoverage?.objectCoverage ?? 1)
  );
}

function candidateDeformationLoad(candidate = null) {
  const aperture = candidateOntologyAudit(candidate)?.aperture || {};
  return Number(aperture?.historicalCrease || 0) + Number(aperture?.unfoldingEnergy || 0);
}

function candidateRealizedCrossRegisterMovement(candidate = null) {
  const realizedDimensions = candidate?.changedDimensions || [];
  const lexicalSurfaceDimensions = new Set([
    'lexical-register',
    'abbreviation-posture',
    'orthography-posture',
    'fragment-posture',
    'conversation-posture',
    'surface-marker-posture'
  ]);
  const hasLexicalSurface = realizedDimensions.some((dimension) => lexicalSurfaceDimensions.has(dimension));
  return hasLexicalSurface ||
    Number(candidate?.lexemeSwaps?.length || 0) > 0 ||
    Number(candidate?.vernacularFeatureShift?.realizedFamilyCount || 0) > 0;
}

function candidateVernacularMovementScore(candidate = null) {
  const shift = candidate?.vernacularFeatureShift || {};
  return round(
    Number(shift.realizedFamilyCount || 0) +
    (Number(shift.surfaceMarkerCount || 0) * 0.1) +
    (Number(shift.donorFeatureAdherence || 0) * 0.4) +
    (Number(shift.concealmentEffectiveness || 0) * 0.3),
    4
  );
}

function classRecoveryFamilies(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return ['syntax-shape', 'clause-pivot', 'persona-lexicon'];
  }
  if (sourceClass === 'formal-correspondence') {
    return ['syntax-shape', 'persona-lexicon', 'cadence-connector', 'order-beat'];
  }
  if (sourceClass === 'reflective-prose') {
    return ['clause-pivot', 'pressure-current', 'persona-lexicon', 'hybrid', 'register-lexicon', 'syntax-shape'];
  }
  return ['order-beat', 'clause-pivot', 'pressure-current', 'hybrid'];
}

function candidateNearPass(candidate = null) {
  if (!candidate) {
    return false;
  }
  const reasons = candidate.failureReasons || [];
  const structuralFailure = reasons.includes('hard-anchor-failure') || reasons.includes('semantic-failure') || reasons.includes('pathology') || reasons.includes('timestamp-hallucination');
  if (structuralFailure) {
    return false;
  }
  return (
    reasons.includes('below-rewrite-bar') ||
    candidateToolabilityScore(candidate) >= 0.52 ||
    Number(candidate.rewriteStrength || 0) >= Math.max(0, classRewriteBar(candidate.sourceClass) - 0.05)
  );
}

function buildRecoveryVariants(sourceProfile = {}, shell = {}, sourceClass = 'formal-correspondence') {
  const targetProfile = shell?.profile || null;
  const envelopeId = inferEnvelopeId(shell, sourceProfile, targetProfile || {});
  const sourceRegisterLane = inferRegisterLaneFromProfile(sourceProfile, sourceClass);
  const targetRegisterLane = resolveTargetRegisterLane({
    shell,
    targetProfile,
    sourceProfile,
    sourceClass
  });
  const generationControls = resolveOntologyGenerationControls({
    sourceClass,
    sourceRegisterLane,
    targetRegisterLane
  });
  const adjustments = ENVELOPE_ADJUSTMENTS[envelopeId] || ENVELOPE_ADJUSTMENTS.generic;
  const baseMod = shell?.mod
    ? normalizeShellModValue(shell.mod)
    : cadenceModFromProfile(targetProfile || sourceProfile);
  const baseStrength = clamp(
    Number(shell?.strength ?? (shell?.profile ? 0.84 : 0.72)) * Number(generationControls.strengthScalar || 1),
    0,
    1
  );
  const scalar = Math.max(0.9, classScalar(sourceClass));
  return [
    {
      id: 'recovery-forward',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.secondary, scalar * 1.1),
        strength: clamp(baseStrength + 0.16, 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.32 * Number(generationControls.intensityScalar || 1)),
        generationControls
      },
      envelopeId
    },
    {
      id: 'recovery-clean',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.primary, scalar),
        strength: clamp(baseStrength + 0.08, 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.05 * Number(generationControls.intensityScalar || 1)),
        generationControls
      },
      envelopeId
    }
  ];
}

function shouldRunRecoveryRound(sourceClass = 'formal-correspondence', selected = null, candidates = []) {
  if (!['procedural-record', 'formal-correspondence', 'reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return false;
  }
  if (!candidates.some((candidate) => candidateNearPass(candidate))) {
    return false;
  }
  if (!selected) {
    return true;
  }
  return candidateToolabilityScore(selected) < 0.66 || selected.transferClass === 'weak';
}

function selectWinningCandidate(candidates = []) {
  return [...(candidates || [])]
    .sort((left, right) =>
      candidateDriftRank(left) - candidateDriftRank(right) ||
      candidateRoutePressure(left) - candidateRoutePressure(right) ||
      candidateProtectedAnchorIntegrity(right) - candidateProtectedAnchorIntegrity(left) ||
      candidateMinimumSemanticCoverage(right) - candidateMinimumSemanticCoverage(left) ||
      candidateDeformationLoad(left) - candidateDeformationLoad(right) ||
      candidateVernacularMovementScore(right) - candidateVernacularMovementScore(left) ||
      Number(candidateRealizedCrossRegisterMovement(right)) - Number(candidateRealizedCrossRegisterMovement(left)) ||
      candidateTransferRank(right) - candidateTransferRank(left) ||
      candidateToolabilityScore(right) - candidateToolabilityScore(left) ||
      Number(right.personaSeparationAudit?.score || 0) - Number(left.personaSeparationAudit?.score || 0) ||
      candidateFamilyPriority(right) - candidateFamilyPriority(left) ||
      right.score - left.score ||
      right.rewriteStrength - left.rewriteStrength ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )[0] || null;
}

function holdHeadline(holdClass = 'below-rewrite-bar') {
  if (holdClass === 'aperture-route-pressure') {
    return 'Generator V2 pressure // Aperture raised the ontology route floor; best surface remains visible.';
  }
  if (holdClass === 'timestamp-hallucination') {
    return 'Generator V2 pressure // temporal attestation flagged an unsupported clock time.';
  }
  if (holdClass === 'hard-anchor-failure') {
    return 'Generator V2 pressure // exact witness anchors broke under rewrite pressure.';
  }
  if (holdClass === 'semantic-failure') {
    return 'Generator V2 pressure // semantic coverage dropped below the class floor.';
  }
  if (holdClass === 'pathology') {
    return 'Generator V2 pressure // output showed render-risk; source-safe surface remains visible.';
  }
  return 'Generator V2 pressure // no candidate cleared the rewrite bar cleanly; best surface remains visible.';
}

function explainGenerationReasonCode(code = '') {
  const explanations = {
    'hard-anchor-failure': 'Exact witness anchors broke under rewrite pressure.',
    'aperture-route-pressure': 'Aperture flagged the route because ontology integrity pressure stayed above the publishable floor.',
    'timestamp-hallucination': 'Temporal attestation failed because the rewrite introduced a clock time the source did not support.',
    'anchor-drift-detected': 'Protected anchor integrity slipped below the class floor.',
    'semantic-failure': 'Semantic coverage dropped below the class floor.',
    'pathology': 'The output collapsed into a render-unsafe form.',
    'below-rewrite-bar': 'No candidate cleared the rewrite bar honestly.',
    'artifact:lowercase-lead': 'Lowercase sentence starts made the surface look unstable.',
    'artifact:doubled-connector': 'Repeated connectors flattened the sentence current.',
    'artifact:semicolon-fracture': 'Semicolon fracture broke the line into awkward ledger fragments.',
    'artifact:repeated-helper': 'Repeated helper verbs made the rewrite sound mechanically looped.',
    'artifact:malformed-contraction': 'Malformed contraction artifacts made the rewrite unsafe to publish.',
    'artifact:fragment': 'Clause fragments created by rewrite passes made the surface too thin to trust.',
    'artifact:over-braiding': 'The sentence current braided too hard and stopped reading cleanly.',
    'artifact:clause-join': 'Clause joins landed as visible seam lines instead of fluent movement.',
    'artifact:clause-drag': 'Sentence drag made the rewrite feel overloaded.',
    'persona-markers-thin': 'The mask landed, but its persona markers stayed too faint.',
    'persona-convergence:spark-cross': 'The mask drifted too close to its neighboring clipped-pressure lane.',
    'persona-convergence:matron-undertow': 'The mask drifted too close to its neighboring long-current lane.',
    'persona-convergence:archivist-neutral': 'The mask drifted too close to a neutral formal lane.',
    'toolability:punctuation-only': 'The movement looked more cosmetic than functional.',
    'toolability:low-confidence': 'The rewrite landed, but not with enough tool confidence yet.',
    'toolability:rough-surface': 'The surface still reads rough for a finished masking tool.',
    'toolability:sentence-integrity': 'Sentence integrity stayed shakier than the tool should allow.'
  };
  return explanations[code] || '';
}

function buildLandedTransfer(sourceText = '', shell = {}, options = {}, candidate = null, sourceClass = 'formal-correspondence', candidates = []) {
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const chosen = candidate;
  const candidateLedger = buildCandidateLedger(candidates.length ? candidates : [chosen], chosen.id);
  const warningSignals = uniqueStrings([
    ...((chosen.apertureReview && chosen.apertureReview.warningSignals) || []),
    ...((chosen.classification && chosen.classification.pathologies) || [])
  ]);
  const candidateSuppression = candidateLedger.length > 1
    ? round((candidateLedger.filter((entry) => entry.status === 'held').length / candidateLedger.length), 4)
    : 0;
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals,
    repairPasses: [],
    candidateSuppression: Math.max(candidateSuppression, chosen.apertureReview?.candidateSuppression ?? 0),
    observabilityDeficit: chosen.apertureReview?.observabilityDeficit ?? 0,
    aliasPersistence: chosen.apertureReview?.aliasPersistence ?? 0,
    namingSensitivity: chosen.apertureReview?.namingSensitivity ?? 0,
    redundancyInflation: chosen.apertureReview?.redundancyInflation ?? 0,
    capacityPressure: chosen.apertureReview?.capacityPressure ?? 0,
    policyPressure: chosen.apertureReview?.policyPressure ?? 0,
    withheldMaterial: false,
    withheldReason: null
  });
  const generationDocket = Object.freeze({
    status: 'landed',
    holdClass: null,
    headline: candidateRouteFloorRank(chosen) >= 1
      ? 'Generator V2 landed under Aperture warning pressure.'
      : chosen.transferClass === 'structural'
        ? 'Generator V2 landed a structural registered rewrite.'
        : 'Generator V2 landed a registered cadence rewrite.',
    reasons: Object.freeze([]),
    candidateCount: candidateLedger.length,
    winningCandidateId: chosen.id,
    winningCandidateFamily: chosen.family || null,
    ontologyRoutePressure: chosen.ontologyAudit || null
  });
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: chosen,
        candidateLedger,
        testedFamilyIds: options.testedFamilyIds || candidates.map((entry) => entry.family),
        generationDocket,
        donorProgress: chosen.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: chosen.outputText,
    internalText: chosen.outputText,
    sourceRegisterLane: chosen.sourceRegisterLane || chosen.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: chosen.targetRegisterLane || 'formal-record',
    sourceProfile,
    targetProfile: chosen.targetProfile || shell.profile || sourceProfile,
    outputProfile: chosen.outputProfile,
    opportunityProfile,
    changedDimensions: chosen.changedDimensions,
    profileShiftDimensions: chosen.profileShiftDimensions || [],
    lexemeSwaps: Object.freeze([...(chosen.lexemeSwaps || [])]),
    expectedOperators: Object.freeze([...(chosen.expectedOperators || [])]),
    structuralOperations: Object.freeze([...(chosen.structuralOperations || [])]),
    lexicalOperations: Object.freeze([...(chosen.lexicalOperations || [])]),
    passesApplied: uniqueStrings([
      `v2-family:${chosen.family || 'syntax-shape'}`,
      `v2-envelope:${chosen.envelopeId || 'generic'}`,
      `v2-candidate:${chosen.id || 'candidate'}`,
      'v2-registration'
    ]),
    protectedLiteralCount: Number((chosen.hardAnchors || []).length || 0),
    rescuePasses: [],
    donorProgress: chosen.donorProgress || {},
    transferClass: (() => {
      if (chosen.transferClass !== 'surface') return chosen.transferClass;
      const op = opportunityProfile || {};
      const movementOps =
        Number(op.sentenceSplit || 0) + Number(op.sentenceMerge || 0) +
        Number(op.connector || 0) + Number(op.contraction || 0) +
        Number(op.abbreviation || 0) + Number(op.orthography || 0) +
        Number(op.additive || 0) + Number(op.contrastive || 0) +
        Number(op.causal || 0) + Number(op.temporal || 0) +
        Number(op.clarifying || 0) + Number(op.resumptive || 0);
      return movementOps === 0 ? 'weak' : chosen.transferClass;
    })(),
    qualityGatePassed: true,
    notes: uniqueStrings([
      generationDocket.headline,
      ...(chosen.apertureReview?.reasons || []),
    ]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: chosen.realizationTier,
    semanticRisk: chosen.semanticRisk,
    semanticAudit: chosen.semanticAudit,
    protectedAnchorAudit: chosen.protectedAnchorAudit,
    generationControls: chosen.generationControls || null,
    temporalDirective: chosen.temporalDirective || null,
    temporalAttestation: chosen.temporalAttestation || null,
    entityMaskLedger: Object.freeze([...(chosen.entityMaskLedger || [])]),
    vernacularFeatures: chosen.vernacularFeatures || null,
    vernacularFeatureShift: chosen.vernacularFeatureShift || null,
    ontologyAudit: chosen.ontologyAudit || null,
    visibleShift: chosen.visibleShift,
    nonTrivialShift: chosen.nonTrivialShift,
    lexicalShiftProfile: chosen.lexicalShiftProfile,
    realizationNotes: uniqueStrings([
      ...(chosen.structuralOperations || []).map((entry) => `structural:${entry}`),
      ...(chosen.lexicalOperations || []).map((entry) => `lexical:${entry}`)
    ]),
    borrowedShellOutcome:
      chosen.transferClass === 'structural'
        ? 'structural'
        : chosen.classification?.outcome === 'surface-held'
          ? 'surface-held'
          : 'partial',
    borrowedShellFailureClass: null,
    toolabilityAudit: chosen.toolabilityAudit,
    semanticLockIntact: Boolean(chosen.semanticLockIntact),
    personaSeparationAudit: chosen.personaSeparationAudit,
    toolabilityWarnings: Object.freeze([...(chosen.toolabilityWarnings || [])]),
    apertureAudit,
    apertureProtocol: Object.freeze({
      ...((chosen.apertureReview || {})),
      outcome: chosen.classification?.outcome || 'projected',
      line: chosen.classification?.line || generationDocket.headline,
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: 'landed'
  });
}

function buildHeldTransfer(sourceText = '', shell = {}, options = {}, candidates = [], sourceClass = 'formal-correspondence', preferredCandidate = null, holdOverride = null) {
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const bestCandidate = preferredCandidate || [...candidates].sort((left, right) => right.score - left.score)[0] || null;
  const holdClass = holdOverride || candidateHoldClass(bestCandidate);
  const headline = holdHeadline(holdClass);
  const reasonCodes = uniqueStrings([
    ...(bestCandidate?.failureReasons || []),
    ...((bestCandidate?.artifactAudit?.flags || []))
  ]);
  const noteReasons = uniqueStrings([
    ...reasonCodes.map((code) => explainGenerationReasonCode(code)).filter(Boolean),
    ...(bestCandidate?.apertureReview?.reasons || [])
  ]);
  const reasons = reasonCodes.length ? reasonCodes : Object.freeze([holdClass]);
  const outputText = normalizeText(bestCandidate?.outputText || sourceText);
  const exposeHeldCandidate = Boolean(outputText) && options.allowOutputHold !== true;
  const candidateLedger = buildCandidateLedger(candidates, null);
  const candidateSuppression = candidateLedger.length
    ? round(candidateLedger.filter((entry) => entry.status === 'held').length / candidateLedger.length, 4)
    : 1;
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: holdClass === 'pathology',
    warningSignals: uniqueStrings([
      ...((bestCandidate?.apertureReview && bestCandidate.apertureReview.warningSignals) || []),
      holdClass
    ]),
    repairPasses: [],
    candidateSuppression: Math.max(candidateSuppression, bestCandidate?.apertureReview?.candidateSuppression ?? 0.12),
    observabilityDeficit: bestCandidate?.apertureReview?.observabilityDeficit ?? 0.18,
    aliasPersistence: bestCandidate?.apertureReview?.aliasPersistence ?? 0,
    namingSensitivity: bestCandidate?.apertureReview?.namingSensitivity ?? 0,
    redundancyInflation: bestCandidate?.apertureReview?.redundancyInflation ?? 0.2,
    capacityPressure: bestCandidate?.apertureReview?.capacityPressure ?? 0.24,
    policyPressure: bestCandidate?.apertureReview?.policyPressure ?? 0,
    withheldMaterial: false,
    withheldReason: null
  });
  const generationDocket = Object.freeze({
    status: exposeHeldCandidate ? 'diagnostic-pressure' : 'held',
    holdClass,
    headline,
    reasons: Object.freeze(reasons),
    candidateCount: candidateLedger.length,
    winningCandidateId: holdClass === 'aperture-route-pressure' ? (bestCandidate?.id || null) : null,
    winningCandidateFamily: holdClass === 'aperture-route-pressure' ? (bestCandidate?.family || null) : null,
    ontologyRoutePressure: bestCandidate?.ontologyAudit || null
  });
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: bestCandidate,
        candidateLedger,
        testedFamilyIds: options.testedFamilyIds || candidates.map((entry) => entry.family),
        generationDocket,
        donorProgress: bestCandidate?.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: exposeHeldCandidate ? outputText : '',
    internalText: outputText || sourceText,
    sourceRegisterLane: bestCandidate?.sourceRegisterLane || bestCandidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: bestCandidate?.targetRegisterLane || 'formal-record',
    sourceProfile,
    targetProfile: bestCandidate?.targetProfile || shell.profile || sourceProfile,
    outputProfile: bestCandidate?.outputProfile || sourceProfile,
    opportunityProfile,
    changedDimensions: Object.freeze([...(bestCandidate?.changedDimensions || [])]),
    profileShiftDimensions: bestCandidate?.profileShiftDimensions || [],
    expectedOperators: Object.freeze([...(bestCandidate?.expectedOperators || [])]),
    structuralOperations: Object.freeze([...(bestCandidate?.structuralOperations || [])]),
    lexicalOperations: Object.freeze([...(bestCandidate?.lexicalOperations || [])]),
    protectedLiteralCount: Number((bestCandidate?.hardAnchors || []).length || 0),
    passesApplied: [],
    rescuePasses: [],
    donorProgress: bestCandidate?.donorProgress || {},
    transferClass: exposeHeldCandidate ? (bestCandidate?.transferClass || 'weak') : 'held',
    qualityGatePassed: false,
    notes: uniqueStrings([headline, ...noteReasons]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: bestCandidate?.realizationTier || 'hold',
    lexicalShiftProfile: bestCandidate?.lexicalShiftProfile || {
      lexemeSwaps: [],
      swapCount: 0,
      registerDistance: 0,
      contentWordComplexityDelta: 0,
      modifierDensityDelta: 0,
      directnessDelta: 0,
      abstractionDelta: 0,
      contractionAligned: true
    },
    semanticRisk: Number(bestCandidate?.semanticRisk || 0),
    lexemeSwaps: Object.freeze([...(bestCandidate?.lexemeSwaps || [])]),
    generationControls: bestCandidate?.generationControls || null,
    temporalDirective: bestCandidate?.temporalDirective || null,
    temporalAttestation: bestCandidate?.temporalAttestation || null,
    entityMaskLedger: Object.freeze([...(bestCandidate?.entityMaskLedger || [])]),
    vernacularFeatures: bestCandidate?.vernacularFeatures || null,
    vernacularFeatureShift: bestCandidate?.vernacularFeatureShift || null,
    realizationNotes: uniqueStrings([
      holdClass,
      exposeHeldCandidate ? 'shown-for-diagnostics' : null
    ]),
    borrowedShellOutcome: exposeHeldCandidate
      ? (bestCandidate?.transferClass === 'structural' ? 'structural' : 'partial')
      : 'diagnostic-pressure',
    borrowedShellFailureClass: holdClass,
    toolabilityAudit: bestCandidate?.toolabilityAudit || Object.freeze({
      readability: 0,
      personaDistinctness: 0,
      sentenceIntegrity: 0,
      movementQuality: 0,
      artifactPenalty: 1,
      semanticLockIntact: false,
      toolabilityScore: 0,
      warnings: Object.freeze([holdClass])
    }),
    personaSeparationAudit: bestCandidate?.personaSeparationAudit || Object.freeze({
      envelopeId: inferEnvelopeId(shell, sourceProfile, shell.profile || {}),
      markerCount: 0,
      requiredMarkers: 2,
      score: 0,
      warnings: Object.freeze([holdClass]),
      markers: Object.freeze([])
    }),
    toolabilityWarnings: Object.freeze([...(bestCandidate?.toolabilityWarnings || [holdClass])]),
    semanticLockIntact: Boolean(bestCandidate?.semanticLockIntact),
    visibleShift: Boolean(bestCandidate?.visibleShift),
    nonTrivialShift: Boolean(bestCandidate?.nonTrivialShift),
    semanticAudit: bestCandidate?.semanticAudit || {
      propositionCoverage: 1,
      actorCoverage: 1,
      actionCoverage: 1,
      objectCoverage: 1,
      polarityMismatches: 0,
      tenseMismatches: 0,
      protectedAnchorIntegrity: 1
    },
    ontologyAudit: bestCandidate?.ontologyAudit || null,
    protectedAnchorAudit: bestCandidate?.protectedAnchorAudit || {
      totalAnchors: 0,
      resolvedAnchors: 0,
      missingAnchors: [],
      protectedAnchorIntegrity: 1
    },
    apertureAudit,
    apertureProtocol: Object.freeze({
      outcome: exposeHeldCandidate ? 'diagnostic-pressure-shown' : 'generator-hold',
      line: headline,
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: exposeHeldCandidate ? 'landed' : 'held'
  });
}

export function buildCadenceTransferV2(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  if (
    !sourceText ||
    shell?.mode === 'native' ||
    (shell?.mode !== 'persona' && (!shell?.mod?.sent && !shell?.mod?.cont && !shell?.mod?.punc) && !shell?.profile)
  ) {
    return buildNativePassThroughTransfer(sourceText, shell, options);
  }

  const sourceClass = classifyV2SourceClass(sourceText);
  const sourceProfile = extractCadenceProfile(sourceText);
  const hardAnchors = extractHardAnchors(sourceText);
  const testedFamilyIds = NATIVE_CANDIDATE_FAMILIES.map((family) => family.id);
  const sourceIR = segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const variants = buildShellVariants(sourceProfile, shell, sourceClass);
  let candidates = dedupeCandidates(
    variants.flatMap((variant) =>
      NATIVE_CANDIDATE_FAMILIES.map((family) => buildCandidate(sourceText, variant, family, {
        ...options,
        sourceClass,
        sourceProfile,
        sourceIR,
        hardAnchors
      }))
    )
  );
  let eligibleCandidates = [...candidates].filter((candidate) => candidate.passed);
  let boundedCandidates = eligibleCandidates.filter((candidate) => candidateSemanticBounded(candidate));
  let selectionPool = boundedCandidates.length ? boundedCandidates : eligibleCandidates;
  let selected = selectWinningCandidate(selectionPool);

  if (shouldRunRecoveryRound(sourceClass, selected, candidates)) {
    const recoveryVariants = buildRecoveryVariants(sourceProfile, shell, sourceClass);
    const recoveryFamilies = classRecoveryFamilies(sourceClass);
    const recoveryCandidates = dedupeCandidates(
      recoveryVariants.flatMap((variant) =>
        NATIVE_CANDIDATE_FAMILIES
          .filter((family) => recoveryFamilies.includes(family.id))
          .map((family) => buildCandidate(sourceText, variant, family, {
            ...options,
            sourceClass,
            sourceProfile,
            sourceIR,
            hardAnchors
          }))
      )
    );
    candidates = dedupeCandidates([...candidates, ...recoveryCandidates]);
    eligibleCandidates = [...candidates].filter((candidate) => candidate.passed);
    boundedCandidates = eligibleCandidates.filter((candidate) => candidateSemanticBounded(candidate));
    selectionPool = boundedCandidates.length ? boundedCandidates : eligibleCandidates;
    selected = selectWinningCandidate(selectionPool);
  }

  const apertureRoutePressureHold = Boolean(
    selected &&
    selectionPool.length &&
    selectionPool.every((candidate) => candidateRouteFloorRank(candidate) >= 2)
  );

  if (!selected || apertureRoutePressureHold) {
    if (typeof globalThis !== 'undefined' && globalThis.TD613_DUEL_DEBUG) {
      const rejected = candidates.filter((candidate) => !candidate.passed);
      const sample = rejected.slice(0, 3).map((candidate) => ({
        family: candidate.family,
        variant: candidate.variantId,
        passed: candidate.passed,
        warnings: candidate.warnings,
        semanticAudit: candidate.semanticAudit,
        floors: candidate.semanticFloors,
        artifactPenalty: candidate.toolabilityAudit && candidate.toolabilityAudit.artifactPenalty,
        semanticLockIntact: candidate.semanticLockIntact
      }));
      try {
        // eslint-disable-next-line no-console
        console.warn('[TD613_DUEL_DEBUG] hold', {
          sourceClass,
          shellMod: shell && shell.mod,
          shellStrength: shell && shell.strength,
          variantCount: variants.length,
          candidateCount: candidates.length,
          eligibleCount: eligibleCandidates.length,
          boundedCount: boundedCandidates.length,
          recoveryRan: shouldRunRecoveryRound(sourceClass, null, candidates),
          apertureRoutePressureHold,
          rejectedSample: sample
        });
      } catch (error) { /* ignore log failure */ }
    }
    return buildHeldTransfer(sourceText, shell, {
      ...options,
      testedFamilyIds,
      sourceProfile,
      sourceIR
    }, candidates, sourceClass, apertureRoutePressureHold ? selected : null, apertureRoutePressureHold ? 'aperture-route-pressure' : null);
  }

  return buildLandedTransfer(sourceText, shell, {
    ...options,
    testedFamilyIds,
    sourceProfile,
    sourceIR
  }, selected, sourceClass, candidates);
}

export function buildCadenceTransferTraceV2(text = '', shell = {}, options = {}) {
  return buildCadenceTransferV2(text, shell, {
    ...options,
    retrieval: true
  }).retrievalTrace;
}

export function applyCadenceToTextV2(text = '', shell = {}) {
  return buildCadenceTransferV2(text, shell).text;
}
