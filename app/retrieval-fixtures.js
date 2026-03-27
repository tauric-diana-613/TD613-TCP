(function () {
  window.TCP_RETRIEVAL_FIXTURES = {
  "generatedAt": "2026-03-27T20:15:36.380Z",
  "cases": {
    "screenshot_reference_under_probe": {
      "id": "screenshot_reference_under_probe",
      "category": "flagship",
      "strength": 0.9,
      "sourceText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
      "donorText": "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 11,
          "sentenceCount": 4,
          "contractionDensity": 0.068,
          "punctuationDensity": 0.205,
          "contentWordComplexity": 0.249,
          "modifierDensity": 0.037,
          "directness": 0.98,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 11.23,
            "sentenceCount": 3,
            "contractionDensity": 0.067,
            "punctuationDensity": 0.204,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.261,
            "modifierDensity": 0.045,
            "hedgeDensity": 0.042,
            "directness": 0.749,
            "abstractionPosture": 1,
            "latinatePreference": 0,
            "recurrencePressure": 0.191
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 5,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Honestly, I wasn't trying to make a speech",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Honestly, I wasn't trying to make a speech",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "honestly",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I just kept circling the story",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "I",
                  "action": "kept",
                  "object": "circling story",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s1c1",
                  "text": "every time I got to the part where I should have left, I remembered one more detail that changed why I stayed",
                  "relationToPrev": "temporal",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "got",
                  "actor": "I",
                  "action": "got",
                  "object": "part where left remembered one",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "finished",
                  "actor": "the time",
                  "action": "finished",
                  "object": "used three qualifiers two apologies",
                  "modifiers": [
                    "apparently"
                  ],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                },
                {
                  "id": "s2c1",
                  "text": "I'm buying time to say the hard part out loud",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "say",
                  "actor": "I",
                  "action": "say",
                  "object": "hard part out loud",
                  "modifiers": [
                    "hard"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 3,
          "sentenceMerge": 2,
          "contraction": 2,
          "connector": 4,
          "lineBreak": 2,
          "additive": 1,
          "contrastive": 0,
          "causal": 1,
          "temporal": 1,
          "clarifying": 3,
          "resumptive": 2
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split",
            "sentence-structure",
            "clause-join-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-phrase",
            "baseline-voice-realization",
            "connector-stance-lexicon",
            "punctuation-finish",
            "connector-stance-rescue"
          ],
          "connectorStrategy": "clarifying",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 1,
            "contrastive": 0,
            "causal": 1,
            "temporal": 1,
            "clarifying": 3,
            "resumptive": 2
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -12.440000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0.03900000000000001,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.03799999999999998,
            "modifierDensityDelta": -0.02500000000000001,
            "directnessDelta": 0.749,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 16,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 279.896,
            "passesApplied": [
              "baseline-split",
              "baseline-phrase",
              "baseline-voice-realization",
              "planned-sentence-split",
              "sentence-structure",
              "clause-join-split",
              "connector-stance-lexicon",
              "punctuation-finish",
              "cleanup-restore",
              "structural-rescue",
              "connector-stance-rescue"
            ],
            "rescuePasses": [
              "structural-rescue",
              "connector-stance-rescue"
            ],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "modifier-density",
              "abstraction-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 265.386,
              "passesApplied": [
                "baseline-floor",
                "clause-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 279.896,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 279.896,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 279.026,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 279.026,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Honestly; I wasn't trying to tell it; and I just kept going over the points when I got to the part where I should have headed out. I remembered one more point that shifted why I stayed. By the time I wrapped up. I had deployed three qualifiers. Two apologies. And the same phrase twice. That's apparently what I do when I'm stalling to tell the tough part out loud.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "modifier-density",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "buying-time",
              "from": "buying time",
              "to": "stalling",
              "kind": "phrase"
            },
            {
              "family": "say",
              "from": "say",
              "to": "tell",
              "kind": "lexeme"
            },
            {
              "family": "use",
              "from": "used",
              "to": "deployed",
              "kind": "lexeme"
            },
            {
              "family": "leave",
              "from": "left",
              "to": "headed out",
              "kind": "lexeme"
            },
            {
              "family": "finish",
              "from": "finished",
              "to": "wrapped up",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "changed",
              "to": "shifted",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "detail",
              "to": "points",
              "kind": "lexeme"
            },
            {
              "family": "hard",
              "from": "hard",
              "to": "tough",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.944,
          "actorCoverage": 1,
          "actionCoverage": 0.93,
          "objectCoverage": 0.86,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.125,
              "globalBagScore": 0.04
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s0c2+s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.308,
              "globalBagScore": 0.16
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0+s3c0",
              "propositionCoverage": 0.7200000000000001,
              "actorCoverage": 1,
              "actionCoverage": 0.6480000000000001,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.444,
              "globalBagScore": 0.2
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.217
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 10
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 10,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Honestly; I wasn't trying to tell it; and I just kept going over the points when I got to the part where I should have headed out",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Honestly",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "honestly",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                },
                {
                  "id": "s0c1",
                  "text": "I wasn't trying to tell it",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "I",
                  "action": "tell",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "and I just kept going over the points when I got to the part where I should have headed out",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "kept",
                  "actor": "I",
                  "action": "kept",
                  "object": "going over points got part",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I remembered one more point that shifted why I stayed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I remembered one more point that shifted why I stayed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "remembered",
                  "actor": "I",
                  "action": "remembered",
                  "object": "one more point shifted why",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "By the time I wrapped up",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "By the time I wrapped up",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "wrapped",
                  "actor": "the time",
                  "action": "wrapped",
                  "object": "up",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "I had deployed three qualifiers",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "I had deployed three qualifiers",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "deployed",
                  "actor": "I",
                  "action": "deployed",
                  "object": "three qualifiers",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Two apologies",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Two apologies",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "two",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "And the same phrase twice",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "And the same phrase twice",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "same",
                  "actor": "the same",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "That's apparently what I do when I'm stalling to tell the tough part out loud.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "That's apparently what I do",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "That",
                  "action": "do",
                  "object": "",
                  "modifiers": [
                    "apparently"
                  ],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                },
                {
                  "id": "s6c1",
                  "text": "I'm stalling to tell the tough part out loud",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "I",
                  "action": "tell",
                  "object": "tough part out loud",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "modifier-density",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "buying-time",
              "from": "buying time",
              "to": "stalling",
              "kind": "phrase"
            },
            {
              "family": "say",
              "from": "say",
              "to": "tell",
              "kind": "lexeme"
            },
            {
              "family": "use",
              "from": "used",
              "to": "deployed",
              "kind": "lexeme"
            },
            {
              "family": "leave",
              "from": "left",
              "to": "headed out",
              "kind": "lexeme"
            },
            {
              "family": "finish",
              "from": "finished",
              "to": "wrapped up",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "changed",
              "to": "shifted",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "detail",
              "to": "points",
              "kind": "lexeme"
            },
            {
              "family": "hard",
              "from": "hard",
              "to": "tough",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "8 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, modifier-density, abstraction-posture."
          ],
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abstraction-posture",
          "connector-stance",
          "contraction-posture",
          "lexical-register",
          "modifier-density",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "buying-time",
          "change",
          "detail",
          "finish",
          "hard",
          "leave",
          "say",
          "use"
        ],
        "relationInventory": [
          "additive:1",
          "causal:1",
          "clarifying:3",
          "contrastive:0",
          "resumptive:2",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-split",
          "clause-join-split",
          "planned-sentence-split",
          "sentence-structure",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-phrase",
          "baseline-voice-realization",
          "connector-stance-lexicon",
          "connector-stance-rescue",
          "punctuation-finish"
        ],
        "connectorStrategy": "clarifying",
        "contractionStrategy": "increase",
        "propositionCoverage": 0.944,
        "actorCoverage": 1,
        "actionCoverage": 0.93,
        "objectCoverage": 0.86,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "screenshot_probe_under_reference": {
      "id": "screenshot_probe_under_reference",
      "category": "flagship",
      "strength": 0.9,
      "sourceText": "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
      "donorText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 23.67,
          "sentenceCount": 3,
          "contractionDensity": 0.028,
          "punctuationDensity": 0.127,
          "contentWordComplexity": 0.299,
          "modifierDensity": 0.07,
          "directness": 0,
          "abstractionPosture": 1
        }
      },
      "retrievalTrace": {
        "sourceText": "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 23.44,
            "sentenceCount": 4,
            "contractionDensity": 0.029,
            "punctuationDensity": 0.128,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.287,
            "modifierDensity": 0.062,
            "hedgeDensity": 0.032,
            "directness": 0.231,
            "abstractionPosture": 0.882,
            "latinatePreference": 0,
            "recurrencePressure": 0.151
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 6,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hey, if you're still out, grab the charger and use the side door",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hey",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "hey",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "you're still out, grab the charger and use the side door",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "grab",
                  "actor": "you",
                  "action": "grab",
                  "object": "charger use side door",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "It sticks, so lean on it",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "It sticks, so lean on it",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "lean",
                  "actor": "It",
                  "action": "lean",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "If nobody hears you right away, wait a second and knock again",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "If nobody hears you right away, wait a second and knock again",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wait",
                  "actor": "you",
                  "action": "wait",
                  "object": "second knock again",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "I'm in back unloading boxes, and I probably won't catch the first try.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "I'm in back unloading boxes",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "i'm",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "I probably won't catch the first try",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "future-modal",
                  "propositionHead": "catch",
                  "actor": "I",
                  "action": "catch",
                  "object": "first try",
                  "modifiers": [
                    "probably"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 4,
          "sentenceMerge": 3,
          "contraction": 3,
          "connector": 2,
          "lineBreak": 3,
          "additive": 3,
          "contrastive": 1,
          "causal": 1,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-contraction",
            "baseline-voice-realization",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "decrease",
          "relationInventory": {
            "additive": 3,
            "contrastive": 1,
            "causal": 1,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 12.440000000000001
          },
          "discourseGoals": {
            "contractionDelta": -0.03900000000000001,
            "hedgeDelta": 0.032
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.03799999999999998,
            "modifierDensityDelta": 0.025,
            "directnessDelta": -0.749,
            "abstractionDelta": 0.382,
            "latinateDelta": 0,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 11,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 269.706,
            "passesApplied": [
              "baseline-merge",
              "baseline-contraction",
              "baseline-voice-realization",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "content-word-complexity",
              "modifier-density",
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 266.706,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 269.706,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 269.706,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 269.706,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 269.706,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Apparently, if you are still out, bring the charger and come through the side doorway, it sticks, so lean on it. If nobody hears you right away, pause a moment and knock again; I am in back unloading boxes, and I probably will not catch the first try.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "wait-second",
              "from": "wait a second",
              "to": "pause a moment",
              "kind": "phrase"
            },
            {
              "family": "grab-charger",
              "from": "grab the charger",
              "to": "bring the charger",
              "kind": "phrase"
            },
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.929,
          "actorCoverage": 1,
          "actionCoverage": 0.903,
          "objectCoverage": 0.9,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 0.675,
              "actorCoverage": 1,
              "actionCoverage": 0.6075,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.375,
              "globalBagScore": 0.188
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 0.9,
              "actorCoverage": 1,
              "actionCoverage": 0.81,
              "objectCoverage": 0.9,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.6,
              "globalBagScore": 0.2
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.286
            }
          ],
          "sourceClauseCount": 6,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 4,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Apparently, if you are still out, bring the charger and come through the side doorway, it sticks, so lean on it",
              "rhetoricalRole": "resumptive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Apparently",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "apparently",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "apparently"
                  ],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                },
                {
                  "id": "s0c1",
                  "text": "you are still out, bring the charger and come through the side doorway, it sticks, so lean on it",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "you",
                  "action": "bring",
                  "object": "charger come through side doorway",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "If nobody hears you right away, pause a moment and knock again; I am in back unloading boxes, and I probably will not catch the first try.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "If nobody hears you right away, pause a moment and knock again",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "pause",
                  "actor": "you",
                  "action": "pause",
                  "object": "moment knock again",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "I am in back unloading boxes, and I probably will not catch the first try",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "future-modal",
                  "propositionHead": "catch",
                  "actor": "I",
                  "action": "catch",
                  "object": "first try",
                  "modifiers": [
                    "probably"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "wait-second",
              "from": "wait a second",
              "to": "pause a moment",
              "kind": "phrase"
            },
            {
              "family": "grab-charger",
              "from": "grab the charger",
              "to": "bring the charger",
              "kind": "phrase"
            },
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, content-word-complexity, modifier-density, directness."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance",
          "content-word-complexity",
          "contraction-posture",
          "directness",
          "lexical-register",
          "modifier-density",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean"
        ],
        "lexemeSwapFamilies": [
          "door",
          "grab-charger",
          "wait-second"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:0",
          "contrastive:1",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge"
        ],
        "lexicalOperations": [
          "baseline-contraction",
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "decrease",
        "propositionCoverage": 0.929,
        "actorCoverage": 1,
        "actionCoverage": 0.903,
        "objectCoverage": 0.9,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "operational_under_reflective": {
      "id": "operational_under_reflective",
      "category": "flagship",
      "strength": 0.88,
      "sourceText": "Door sticks. Knock twice. I am in back.",
      "donorText": "Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 30,
          "sentenceCount": 1,
          "contractionDensity": 0,
          "punctuationDensity": 0.133,
          "contentWordComplexity": 0.294,
          "modifierDensity": 0.111,
          "directness": 0.18,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "Door sticks. Knock twice. I am in back.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 29.41,
            "sentenceCount": 3,
            "contractionDensity": 0,
            "punctuationDensity": 0.138,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.285,
            "modifierDensity": 0.084,
            "hedgeDensity": 0.025,
            "directness": 0.3,
            "abstractionPosture": 0.5,
            "latinatePreference": 0,
            "recurrencePressure": 0.144
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 3,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Door sticks",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Door sticks",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "door",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Knock twice",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Knock twice",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "Knock",
                  "actor": "",
                  "action": "Knock",
                  "object": "twice",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "I am in back.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "I am in back",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "back",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 2,
          "contraction": 1,
          "connector": 0,
          "lineBreak": 2,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 26.740000000000002
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.025
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.02799999999999997,
            "modifierDensityDelta": 0.084,
            "directnessDelta": -0.38000000000000006,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 21,
            "swapConnector": 0,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 266.562,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "content-word-complexity",
              "modifier-density",
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 263.424,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 266.562,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 266.562,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 266.562,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 266.562,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Apparently, door sticks; knock twice, and I am in back.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.1,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0+s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.667
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c0+s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.333
            }
          ],
          "sourceClauseCount": 3,
          "outputClauseCount": 2
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 2,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Apparently, door sticks; knock twice, and I am in back.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Apparently, door sticks",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "apparently",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "apparently"
                  ],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                },
                {
                  "id": "s0c1",
                  "text": "knock twice, and I am in back",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "knock",
                  "actor": "I",
                  "action": "knock",
                  "object": "twice back",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.1,
          "realizationNotes": [
            "Register shift surfaced through lexical-register, content-word-complexity, modifier-density, directness."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance",
          "content-word-complexity",
          "directness",
          "lexical-register",
          "modifier-density",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "reflective_under_operational": {
      "id": "reflective_under_operational",
      "category": "flagship",
      "strength": 0.88,
      "sourceText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed.",
      "donorText": "Hey, grab the charger. Use the side door. It sticks, so lean on it. I am in back.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 4.5,
          "sentenceCount": 4,
          "contractionDensity": 0,
          "punctuationDensity": 0.333,
          "contentWordComplexity": 0.19,
          "modifierDensity": 0,
          "directness": 1,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 4.8,
            "sentenceCount": 2,
            "contractionDensity": 0.001,
            "punctuationDensity": 0.328,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.221,
            "modifierDensity": 0.048,
            "hedgeDensity": 0.054,
            "directness": 0.761,
            "abstractionPosture": 1,
            "latinatePreference": 0,
            "recurrencePressure": 0.3
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 3,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Honestly, I wasn't trying to make a speech",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Honestly, I wasn't trying to make a speech",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "honestly",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I just kept circling the story",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "I",
                  "action": "kept",
                  "object": "circling story",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s1c1",
                  "text": "every time I got to the part where I should have left, I remembered one more detail that changed why I stayed",
                  "relationToPrev": "temporal",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "got",
                  "actor": "I",
                  "action": "got",
                  "object": "part where left remembered one",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 1,
          "contraction": 1,
          "connector": 3,
          "lineBreak": 1,
          "additive": 0,
          "contrastive": 0,
          "causal": 1,
          "temporal": 0,
          "clarifying": 1,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-contraction",
            "baseline-phrase",
            "baseline-voice-realization",
            "connector-stance-lexicon",
            "contraction-auxiliary"
          ],
          "connectorStrategy": "causal",
          "contractionStrategy": "decrease",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 1,
            "temporal": 0,
            "clarifying": 1,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -13.7
          },
          "discourseGoals": {
            "contractionDelta": -0.026,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.099,
            "modifierDensityDelta": 0,
            "directnessDelta": 0.761,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 21,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 245.184,
            "passesApplied": [
              "baseline-split",
              "baseline-contraction",
              "baseline-phrase",
              "baseline-voice-realization",
              "connector-stance-lexicon",
              "contraction-auxiliary"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "abstraction-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 213.172,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 245.184,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-phrase",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 245.184,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-phrase",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 245.184,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-phrase",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 245.184,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-phrase",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Honestly. I was not trying to tell it. I just kept going over the points when I got to the part where I should have headed out. I remembered one more point that shifted why I stayed.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "leave",
              "from": "left",
              "to": "headed out",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "changed",
              "to": "shifted",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "detail",
              "to": "points",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.85,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.059
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.375,
              "globalBagScore": 0.313
            }
          ],
          "sourceClauseCount": 3,
          "outputClauseCount": 5
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 5,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Honestly",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Honestly",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "honestly",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I was not trying to tell it",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I was not trying to tell it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "I",
                  "action": "tell",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "I just kept going over the points when I got to the part where I should have headed out",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "I just kept going over the points",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "I",
                  "action": "kept",
                  "object": "going over points",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s2c1",
                  "text": "I got to the part where I should have headed out",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "got",
                  "actor": "I",
                  "action": "got",
                  "object": "part where headed out",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "I remembered one more point that shifted why I stayed.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "I remembered one more point that shifted why I stayed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "remembered",
                  "actor": "I",
                  "action": "remembered",
                  "object": "one more point shifted why",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "leave",
              "from": "left",
              "to": "headed out",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "changed",
              "to": "shifted",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "detail",
              "to": "points",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, abstraction-posture."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abstraction-posture",
          "connector-stance",
          "contraction-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "change",
          "detail",
          "leave"
        ],
        "relationInventory": [
          "additive:0",
          "causal:1",
          "clarifying:1",
          "contrastive:0",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-split"
        ],
        "lexicalOperations": [
          "baseline-contraction",
          "baseline-phrase",
          "baseline-voice-realization",
          "connector-stance-lexicon",
          "contraction-auxiliary"
        ],
        "connectorStrategy": "causal",
        "contractionStrategy": "decrease",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.85,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "contraction_heavy": {
      "id": "contraction_heavy",
      "category": "flagship",
      "strength": 0.9,
      "sourceText": "I am not sure if it is ready. I will bring it when I can.",
      "donorText": "I'm not sure it's ready. I'll bring it when I can.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 5.5,
          "sentenceCount": 2,
          "contractionDensity": 0.273,
          "punctuationDensity": 0.182,
          "contentWordComplexity": 0.095,
          "modifierDensity": 0,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "I am not sure if it is ready. I will bring it when I can.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 5.54,
            "sentenceCount": 2,
            "contractionDensity": 0.268,
            "punctuationDensity": 0.181,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.129,
            "modifierDensity": 0,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0,
            "recurrencePressure": 0.169
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 4,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I am not sure if it is ready",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I am not sure",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "sure",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "it is ready",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "it",
                  "action": "is",
                  "object": "ready",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I will bring it when I can.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I will bring it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "bring",
                  "actor": "I",
                  "action": "bring",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "I can",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "I",
                  "action": "can",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 1,
          "contraction": 3,
          "connector": 1,
          "lineBreak": 1,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "split-rules"
          ],
          "lexicalRegisterOperationsSelected": [
            "phrase-texture",
            "contraction"
          ],
          "connectorStrategy": "temporal",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -1.96
          },
          "discourseGoals": {
            "contractionDelta": 0.268,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.10899999999999999,
            "modifierDensityDelta": 0,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 3,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 225.568,
            "passesApplied": [
              "split-rules",
              "phrase-texture",
              "contraction"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "content-word-complexity",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 225.568,
              "passesApplied": [
                "split-rules",
                "phrase-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 222.568,
              "passesApplied": [
                "baseline-contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 222.568,
              "passesApplied": [
                "baseline-contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 222.568,
              "passesApplied": [
                "baseline-contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 222.568,
              "passesApplied": [
                "baseline-contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I'm not sure if it's ready. I'll bring it when I can.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "content-word-complexity",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.875,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.333
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0
            }
          ],
          "sourceClauseCount": 4,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 4,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I'm not sure if it's ready",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I'm not sure",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "i'm",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "it's ready",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "it's",
                  "actor": "it",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I'll bring it when I can.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I'll bring it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "bring",
                  "actor": "I",
                  "action": "bring",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "I can",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "I",
                  "action": "can",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "content-word-complexity",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "realizationNotes": [
            "Register shift surfaced through content-word-complexity."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance",
          "content-word-complexity",
          "contraction-posture",
          "punctuation-shape",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [
          "split-rules"
        ],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
        ],
        "connectorStrategy": "temporal",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.875,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "contraction_light": {
      "id": "contraction_light",
      "category": "flagship",
      "strength": 0.9,
      "sourceText": "I'm sure it's ready. I'll bring it when I can.",
      "donorText": "I am certain it is ready. I will bring it when I can.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 6.5,
          "sentenceCount": 2,
          "contractionDensity": 0,
          "punctuationDensity": 0.154,
          "contentWordComplexity": 0.381,
          "modifierDensity": 0,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "I'm sure it's ready. I'll bring it when I can.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 6.47,
            "sentenceCount": 2,
            "contractionDensity": 0.005,
            "punctuationDensity": 0.155,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.314,
            "modifierDensity": 0,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0,
            "recurrencePressure": 0.15
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 3,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I'm sure it's ready",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I'm sure it's ready",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "i'm",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I'll bring it when I can.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I'll bring it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "bring",
                  "actor": "I",
                  "action": "bring",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "I can",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "I",
                  "action": "can",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 1,
          "contraction": 3,
          "connector": 1,
          "lineBreak": 1,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "temporal",
          "contractionStrategy": "decrease",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 1.4699999999999998
          },
          "discourseGoals": {
            "contractionDelta": -0.295,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.219,
            "modifierDensityDelta": 0,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 1,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 248.234,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "content-word-complexity",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 248.234,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 233.574,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "sentence-structure"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 233.574,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "sentence-structure"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 233.574,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "sentence-structure"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 233.574,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "sentence-structure"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "content-word-complexity",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I am sure it is ready; I will bring it when I can.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "content-word-complexity",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.333
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            }
          ],
          "sourceClauseCount": 3,
          "outputClauseCount": 2
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 2,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I am sure it is ready; I will bring it when I can.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I am sure it is ready",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "sure ready",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "I will bring it when I can",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "bring",
                  "actor": "I",
                  "action": "bring",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "content-word-complexity",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "realizationNotes": [
            "Register shift surfaced through content-word-complexity."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance",
          "content-word-complexity",
          "contraction-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "temporal",
        "contractionStrategy": "decrease",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "pathology_additive_collapse_blocked": {
      "id": "pathology_additive_collapse_blocked",
      "category": "pathology",
      "strength": 0.9,
      "sourceText": "Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.",
      "donorText": "Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 30,
          "sentenceCount": 1,
          "contractionDensity": 0,
          "punctuationDensity": 0.133,
          "contentWordComplexity": 0.294,
          "modifierDensity": 0.111,
          "directness": 0.18,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 29.57,
            "sentenceCount": 3,
            "contractionDensity": 0,
            "punctuationDensity": 0.134,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.282,
            "modifierDensity": 0.085,
            "hedgeDensity": 0.025,
            "directness": 0.138,
            "abstractionPosture": 0.5,
            "latinatePreference": 0,
            "recurrencePressure": 0.133
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 3,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Because the room stayed loud, I kept the note",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Because the room stayed loud, I kept the note",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "kept",
                  "actor": "the room",
                  "action": "kept",
                  "object": "note",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "But the line dragged",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "But the line dragged",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "line",
                  "actor": "the line",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "So I left this mark behind.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "So I left this mark behind",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "I",
                  "action": "left",
                  "object": "mark behind",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 2,
          "contraction": 0,
          "connector": 4,
          "lineBreak": 2,
          "additive": 0,
          "contrastive": 1,
          "causal": 2,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-function-word"
          ],
          "connectorStrategy": "causal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 2,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 23.240000000000002
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.025
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.03899999999999998,
            "modifierDensityDelta": 0.085,
            "directnessDelta": 0.138,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 19,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 77.066,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "baseline-function-word",
              "planned-sentence-merge"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Transfer missed donor lexical/register realization."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 71.448,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 77.066,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            },
            {
              "spec": "merge-heavy",
              "score": 77.066,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 77.066,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": 77.066,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.",
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "donor-underfit",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.429
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.429
            }
          ],
          "sourceClauseCount": 3,
          "outputClauseCount": 3
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 3,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Because the room stayed loud, I kept the note",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Because the room stayed loud, I kept the note",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "kept",
                  "actor": "the room",
                  "action": "kept",
                  "object": "note",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "But the line dragged",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "But the line dragged",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "line",
                  "actor": "the line",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "So I left this mark behind.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "So I left this mark behind",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "I",
                  "action": "left",
                  "object": "mark behind",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "donor-underfit",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0,
          "realizationNotes": [],
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        }
      },
      "semanticContract": {
        "transferClass": "rejected",
        "realizationTier": "none",
        "changedDimensions": [],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:2",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge",
          "planned-sentence-merge"
        ],
        "lexicalOperations": [
          "baseline-function-word",
          "baseline-voice-realization"
        ],
        "connectorStrategy": "causal",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "pathology_connector_stack_blocked": {
      "id": "pathology_connector_stack_blocked",
      "category": "pathology",
      "strength": 0.88,
      "sourceText": "I left early though if the train arrived on time. Honestly, and also the signal worked. But because the door was unlocked, I stayed.",
      "donorText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 23.67,
          "sentenceCount": 3,
          "contractionDensity": 0.028,
          "punctuationDensity": 0.127,
          "contentWordComplexity": 0.299,
          "modifierDensity": 0.07,
          "directness": 0,
          "abstractionPosture": 1
        }
      },
      "retrievalTrace": {
        "sourceText": "I left early though if the train arrived on time. Honestly, and also the signal worked. But because the door was unlocked, I stayed.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 23.33,
            "sentenceCount": 3,
            "contractionDensity": 0.027,
            "punctuationDensity": 0.129,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.321,
            "modifierDensity": 0.119,
            "hedgeDensity": 0.042,
            "directness": 0,
            "abstractionPosture": 0.88,
            "latinatePreference": 0,
            "recurrencePressure": 0.151
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 5,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I left early though if the train arrived on time",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I left early",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "I",
                  "action": "left",
                  "object": "early",
                  "modifiers": [
                    "early"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "if the train arrived on time",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "train",
                  "actor": "the train",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Honestly, and also the signal worked",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Honestly, and also the signal worked",
                  "relationToPrev": "start",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "honestly",
                  "actor": "the signal",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly",
                    "signal"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "But because the door was unlocked, I stayed.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "But",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "the door was unlocked, I stayed",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the door",
                  "action": "was",
                  "object": "unlocked stayed",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 2,
          "contraction": 0,
          "connector": 3,
          "lineBreak": 2,
          "additive": 2,
          "contrastive": 2,
          "causal": 1,
          "temporal": 0,
          "clarifying": 1,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "clause-join-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-rescue"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 2,
            "contrastive": 2,
            "causal": 1,
            "temporal": 0,
            "clarifying": 1,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 15.329999999999998
          },
          "discourseGoals": {
            "contractionDelta": 0.027,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.069,
            "modifierDensityDelta": -0.15400000000000003,
            "directnessDelta": 0,
            "abstractionDelta": 0.38,
            "latinateDelta": 0,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 13,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 200.696,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "planned-sentence-merge",
              "clause-join-split",
              "cleanup-restore",
              "structural-rescue",
              "connector-stance-rescue"
            ],
            "rescuePasses": [
              "structural-rescue",
              "connector-stance-rescue"
            ],
            "changedDimensions": [
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "content-word-complexity",
              "modifier-density"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 123.012,
              "passesApplied": [
                "merge-pairs",
                "clause-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "content-word-complexity",
                "modifier-density",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Banned connector stack detected: \\bthough\\s+if\\b",
                "Banned connector stack detected: \\bhonestly[,;]?\\s+and\\b"
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 200.696,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "clause-join-split",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 200.696,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "clause-join-split",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 200.696,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "clause-join-split",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 200.696,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "clause-join-split",
                "cleanup-restore",
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "modifier-density"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I departed early if the train arrived on time, though honestly. And also the sign worked, because the doorway was unlocked. I stayed.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density"
          ],
          "lexemeSwaps": [
            {
              "family": "leave",
              "from": "left",
              "to": "departed",
              "kind": "lexeme"
            },
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "signal",
              "from": "signal",
              "to": "sign",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 1,
              "globalBagScore": 0.286
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s1c1+s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.429
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 6
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 6,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I departed early if the train arrived on time, though honestly",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I departed early",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "departed",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "early"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "the train arrived on time",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "train",
                  "actor": "the train",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "honestly",
                  "relationToPrev": "clarifying",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "honestly",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "honestly"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "And also the sign worked, because the doorway was unlocked",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "And also the sign worked",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "sign",
                  "actor": "the sign",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the doorway was unlocked",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the doorway",
                  "action": "was",
                  "object": "unlocked",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "I stayed.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "I stayed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "stayed",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "modifier-density"
          ],
          "lexemeSwaps": [
            {
              "family": "leave",
              "from": "left",
              "to": "departed",
              "kind": "lexeme"
            },
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "signal",
              "from": "signal",
              "to": "sign",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, content-word-complexity, modifier-density."
          ],
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance",
          "content-word-complexity",
          "lexical-register",
          "modifier-density",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "door",
          "leave",
          "signal"
        ],
        "relationInventory": [
          "additive:2",
          "causal:1",
          "clarifying:1",
          "contrastive:2",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-rescue"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "low_opportunity_visible_shift": {
      "id": "low_opportunity_visible_shift",
      "category": "low-opportunity",
      "strength": 0.9,
      "sourceText": "Stone settles under glass.",
      "donorText": "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 11,
          "sentenceCount": 4,
          "contractionDensity": 0.068,
          "punctuationDensity": 0.205,
          "contentWordComplexity": 0.249,
          "modifierDensity": 0.037,
          "directness": 0.98,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Stone settles under glass.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 10.87,
            "sentenceCount": 1,
            "contractionDensity": 0.067,
            "punctuationDensity": 0.206,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.274,
            "modifierDensity": 0.028,
            "hedgeDensity": 0,
            "directness": 0.749,
            "abstractionPosture": 0.5,
            "latinatePreference": 0,
            "recurrencePressure": 0.198
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 1,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Stone settles under glass.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Stone settles under glass",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stone",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 0,
          "contraction": 0,
          "connector": 0,
          "lineBreak": 0,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "weak",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [
            "contraction"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 6.869999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0.067,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.08299999999999996,
            "modifierDensityDelta": 0.028,
            "directnessDelta": 0.749,
            "abstractionDelta": 0,
            "latinateDelta": 0,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 5,
            "swapConnector": 0,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 68.378,
            "passesApplied": [
              "merge-pairs",
              "clause-texture",
              "contraction"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "content-word-complexity"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 68.378,
              "passesApplied": [
                "merge-pairs",
                "clause-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "content-word-complexity"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 65.378,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "content-word-complexity"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 65.378,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "content-word-complexity"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 65.378,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "content-word-complexity"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 65.378,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "content-word-complexity"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Stone sets under glass.",
          "transferClass": "weak",
          "borrowedShellOutcome": "subtle",
          "borrowedShellFailureClass": "lexical-underreach",
          "realizationTier": "cadence-only",
          "changedDimensions": [
            "content-word-complexity"
          ],
          "lexemeSwaps": [
            {
              "family": "settle",
              "from": "settles",
              "to": "sets",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 1
            }
          ],
          "sourceClauseCount": 1,
          "outputClauseCount": 1
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 1,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Stone sets under glass.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Stone sets under glass",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stone",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "weak",
          "borrowedShellOutcome": "subtle",
          "borrowedShellFailureClass": "lexical-underreach",
          "realizationTier": "cadence-only",
          "changedDimensions": [
            "content-word-complexity"
          ],
          "lexemeSwaps": [
            {
              "family": "settle",
              "from": "settles",
              "to": "sets",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Register shift surfaced through content-word-complexity."
          ],
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "weak",
        "realizationTier": "cadence-only",
        "changedDimensions": [
          "content-word-complexity"
        ],
        "lexemeSwapFamilies": [
          "settle"
        ],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [
          "contraction"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "protected_literal_survival": {
      "id": "protected_literal_survival",
      "category": "literal",
      "strength": 0.9,
      "sourceText": "Meet at 9:30, bring ID ZX-17.",
      "donorText": "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.9,
        "profile": {
          "avgSentenceLength": 23.67,
          "sentenceCount": 3,
          "contractionDensity": 0.028,
          "punctuationDensity": 0.127,
          "contentWordComplexity": 0.299,
          "modifierDensity": 0.07,
          "directness": 0,
          "abstractionPosture": 1
        }
      },
      "retrievalTrace": {
        "sourceText": "Meet at 9:30, bring ID ZX-17.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.9,
          "profile": {
            "avgSentenceLength": 23.39,
            "sentenceCount": 1,
            "contractionDensity": 0.027,
            "punctuationDensity": 0.134,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.228,
            "modifierDensity": 0.053,
            "hedgeDensity": 0.032,
            "directness": 0.203,
            "abstractionPosture": 0.882,
            "latinatePreference": 0,
            "recurrencePressure": 0.162
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 1,
            "literalSpans": [
              {
                "value": "9:30",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "ID",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "ZX-17",
                "placeholder": "zzprotlitczz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Meet at zzprotlitazz, bring zzprotlitbzz zzprotlitczz.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Meet at zzprotlitazz, bring zzprotlitbzz zzprotlitczz",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "",
                  "action": "bring",
                  "object": "zzprotlitbzz zzprotlitczz",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 0,
          "contraction": 0,
          "connector": 0,
          "lineBreak": 0,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "weak",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [
            "contraction"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 15.39
          },
          "discourseGoals": {
            "contractionDelta": 0.027,
            "hedgeDelta": 0.032
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.228,
            "modifierDensityDelta": 0.053,
            "directnessDelta": -0.657,
            "abstractionDelta": 0.382,
            "latinateDelta": 0,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 11,
            "swapConnector": 0,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 180.198,
            "passesApplied": [
              "merge-pairs",
              "clause-texture",
              "contraction"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "lexical-register",
              "content-word-complexity",
              "modifier-density",
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 180.198,
              "passesApplied": [
                "merge-pairs",
                "clause-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 177.198,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 177.198,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 177.198,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 177.198,
              "passesApplied": [
                "baseline-voice-realization"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "lexical-register",
                "content-word-complexity",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Meet at 9:30, bring ID ZX-17.",
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "literal-lock",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.75,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.167
            }
          ],
          "sourceClauseCount": 1,
          "outputClauseCount": 1
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 1,
            "literalSpans": [
              {
                "value": "9:30",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "ID",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "ZX-17",
                "placeholder": "zzprotlitczz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Meet at 9:30, bring ID ZX-17.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Meet at 9:30, bring ID ZX-17",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "",
                  "action": "bring",
                  "object": "id zx 17",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "literal-lock",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        }
      },
      "semanticContract": {
        "transferClass": "rejected",
        "realizationTier": "none",
        "changedDimensions": [],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [
          "contraction"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.75,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    }
  }
};
})();
