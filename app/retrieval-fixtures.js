(function () {
  window.TCP_RETRIEVAL_FIXTURES = {
  "generatedAt": "2026-04-02T04:08:39.003Z",
  "cases": {
    "building-access-formal-record-under-rushed-mobile": {
      "id": "building-access-formal-record-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.",
      "donorText": "west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 9.86,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.145,
          "contentWordComplexity": 0.209,
          "modifierDensity": 0,
          "directness": 0.54,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 10.05,
            "sentenceCount": 9,
            "contractionDensity": 0,
            "punctuationDensity": 0.146,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.248,
            "modifierDensity": 0.065,
            "hedgeDensity": 0.022,
            "directness": 0.54,
            "abstractionPosture": 0.2,
            "latinatePreference": 0.016,
            "recurrencePressure": 0.145
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 9,
            "clauseCount": 12,
            "literalSpans": [
              {
                "value": "08:14",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "08:19",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "08:31",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "08:37",
                "placeholder": "zzprotlitdzz"
              },
              {
                "value": "08:42",
                "placeholder": "zzprotlitezz"
              },
              {
                "value": "09:06",
                "placeholder": "zzprotlitfzz"
              },
              {
                "value": "3",
                "placeholder": "zzprotlitgzz"
              },
              {
                "value": "118",
                "placeholder": "zzprotlithzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "At zzprotlitazz on Monday, Door zzprotlitgzz at the West Annex began presenting a false-open state",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "At zzprotlitazz on Monday, Door zzprotlitgzz at the West Annex began presenting a false-open state",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "began",
                  "actor": "the West",
                  "action": "began",
                  "object": "presenting false open state",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The reader accepted active badges and flashed green, but the strike did not release",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The reader accepted active badges and flashed green, but the strike did not release",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "release",
                  "actor": "The reader",
                  "action": "release",
                  "object": "",
                  "modifiers": [
                    "active"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The first confirmed access failure affected courier intake at zzprotlitbzz, when a refrigerated medication delivery for Suite zzprotlithzz could not clear the corridor",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The first confirmed access failure affected courier intake at zzprotlitbzz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The first",
                  "action": "confirmed",
                  "object": "access failure affected courier intake",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "a refrigerated medication delivery for Suite zzprotlithzz could not clear the corridor",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "could",
                  "actor": "a refrigerated",
                  "action": "could",
                  "object": "clear corridor",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Facilities first treated the event as a low-voltage latch issue",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "the event",
                  "action": "issue",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "the meter reading did not support that assumption",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "did",
                  "actor": "the meter",
                  "action": "did",
                  "object": "support assumption",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "By zzprotlitczz we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "By zzprotlitczz we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "confirmed",
                  "actor": "we",
                  "action": "confirmed",
                  "object": "overnight badge renewal push stopped",
                  "modifiers": [
                    "renewal",
                    "newly"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "older local cache entries still passed",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "older",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Deliveries were rerouted to the south receiving desk at zzprotlitdzz",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Deliveries were rerouted to the south receiving desk at zzprotlitdzz",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "were",
                  "actor": "the south",
                  "action": "were",
                  "object": "rerouted south receiving desk at",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Manual escort restored controlled entry at zzprotlitezz, and the controller was rolled back at zzprotlitfzz",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Manual escort restored controlled entry at zzprotlitezz, and the controller was rolled back at zzprotlitfzz",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the controller",
                  "action": "was",
                  "object": "rolled back at zzprotlitfzz",
                  "modifiers": [
                    "manual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "log",
                  "actor": "the custody",
                  "action": "log",
                  "object": "remains continuous",
                  "modifiers": [
                    "continuous"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "Required",
                  "actor": "a live",
                  "action": "Required",
                  "object": "correction no future firmware push",
                  "modifiers": [
                    "live",
                    "archive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 4,
          "sentenceMerge": 8,
          "contraction": 2,
          "connector": 7,
          "lineBreak": 8,
          "additive": 4,
          "contrastive": 2,
          "causal": 1,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "contraction-auxiliary",
            "punctuation-finish",
            "lexical-register-rescue",
            "connector-stance-rescue"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 4,
            "contrastive": 2,
            "causal": 1,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -8.73
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.022
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.125,
            "modifierDensityDelta": 0,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.049,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 18,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 145.188,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "planned-sentence-split",
              "contraction-auxiliary",
              "punctuation-finish",
              "cleanup-restore",
              "lexical-register-rescue",
              "connector-stance-rescue"
            ],
            "rescuePasses": [
              "lexical-register-rescue",
              "connector-stance-rescue"
            ],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Structural opportunity existed but the current candidate collapsed into additive drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 6.394,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "contraction-posture",
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 145.188,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "split-heavy",
              "score": 145.188,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 145.188,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "rescuePasses": [
                "lexical-register-rescue",
                "connector-stance-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike didn't release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 couldn't clear the corridor. Facilities first thought it was a low-voltage latch issue. The meter reading didn't help that assumption. By 08:31 we knew the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries got rerouted to the south receiving desk at 08:37. Manual escort got controlled entry back at 08:42, and the controller was rolled back at 09:06. No restricted room got breached, no cold-chain item got lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance"
          ],
          "lexemeSwaps": [
            {
              "family": "could-not",
              "from": "could not",
              "to": "couldn't",
              "kind": "phrase"
            },
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "lexical-register-rescue",
            "connector-stance-rescue",
            "partial-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.954,
          "actorCoverage": 0.954,
          "actionCoverage": 0.95,
          "objectCoverage": 0.875,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.115
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.058
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.135
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.019
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 0.45,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.5,
              "globalBagScore": 0.019
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.019
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.3,
              "globalBagScore": 0.093
            },
            {
              "sourceClauseId": "s4c1",
              "matchedClauseId": "s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.038
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.096
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.4,
              "globalBagScore": 0.074
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s9c0",
              "propositionCoverage": 0.45,
              "actorCoverage": 1,
              "actionCoverage": 0.405,
              "objectCoverage": 0.5,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.2,
              "globalBagScore": 0.037
            },
            {
              "sourceClauseId": "s8c0",
              "matchedClauseId": "s10c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.154
            }
          ],
          "sourceClauseCount": 12,
          "outputClauseCount": 13
        },
        "protectedAnchorAudit": {
          "totalAnchors": 8,
          "resolvedAnchors": 8,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 11,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "08:14",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "08:19",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "08:31",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "08:37",
                "placeholder": "zzprotlitdzz"
              },
              {
                "value": "08:42",
                "placeholder": "zzprotlitezz"
              },
              {
                "value": "09:06",
                "placeholder": "zzprotlitfzz"
              },
              {
                "value": "3",
                "placeholder": "zzprotlitgzz"
              },
              {
                "value": "118",
                "placeholder": "zzprotlithzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "At 08:14 on Monday",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "At 08:14 on Monday",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "at",
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
              "raw": "Door 3 at the West Annex began presenting a false-open state",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Door 3 at the West Annex began presenting a false-open state",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "began",
                  "actor": "the West",
                  "action": "began",
                  "object": "presenting false open state",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The reader accepted active badges and flashed green, but the strike didn't release",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The reader accepted active badges and flashed green, but the strike didn't release",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "release",
                  "actor": "The reader",
                  "action": "release",
                  "object": "",
                  "modifiers": [
                    "active"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 couldn't clear the corridor",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The first confirmed access failure affected courier intake at 08:19",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The first",
                  "action": "confirmed",
                  "object": "access failure affected courier intake",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "a refrigerated medication delivery for Suite 118 couldn't clear the corridor",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "future-modal",
                  "propositionHead": "refrigerated",
                  "actor": "a refrigerated",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Facilities first thought it was a low-voltage latch issue",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Facilities first thought it was a low-voltage latch issue",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "issue",
                  "actor": "it",
                  "action": "issue",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "The meter reading didn't help that assumption",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "The meter reading didn't help that assumption",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "meter",
                  "actor": "The meter",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "By 08:31 we knew the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "By 08:31 we knew the overnight badge-renewal push had stopped validating newly renewed credentials",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "had",
                  "actor": "we",
                  "action": "had",
                  "object": "stopped validating newly renewed credentials",
                  "modifiers": [
                    "renewal",
                    "newly"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "older local cache entries still passed",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "older",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Deliveries got rerouted to the south receiving desk at 08:37",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Deliveries got rerouted to the south receiving desk at 08:37",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "got",
                  "actor": "the south",
                  "action": "got",
                  "object": "rerouted south receiving desk at",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Manual escort got controlled entry back at 08:42, and the controller was rolled back at 09:06",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Manual escort got controlled entry back at 08:42, and the controller was rolled back at 09:06",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "got",
                  "actor": "the controller",
                  "action": "got",
                  "object": "controlled entry back at 08",
                  "modifiers": [
                    "manual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "No restricted room got breached, no cold-chain item got lost, and the custody log remains continuous",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "No restricted room got breached, no cold-chain item got lost, and the custody log remains continuous",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "got",
                  "actor": "the custody",
                  "action": "got",
                  "object": "breached no cold chain item",
                  "modifiers": [
                    "continuous"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "Required correction: no future firmware push may close without a live-door test, A latch release check, and a signed handoff from systems to archive operations.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "Required correction: no future firmware push may close without a live-door test, A latch release check, and a signed handoff from systems to archive operations",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "Required",
                  "actor": "a live",
                  "action": "Required",
                  "object": "correction no future firmware push",
                  "modifiers": [
                    "live",
                    "archive"
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
            "sentence-spread",
            "contraction-posture",
            "connector-stance"
          ],
          "lexemeSwaps": [
            {
              "family": "could-not",
              "from": "could not",
              "to": "couldn't",
              "kind": "phrase"
            },
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "lexical-register-rescue",
            "connector-stance-rescue",
            "partial-rescue"
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
          "contraction-posture",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "could-not",
          "help"
        ],
        "relationInventory": [
          "additive:4",
          "causal:1",
          "clarifying:0",
          "contrastive:2",
          "resumptive:1",
          "temporal:2"
        ],
        "structuralOperations": [
          "baseline-split",
          "planned-sentence-split"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-rescue",
          "contraction-auxiliary",
          "lexical-register-rescue",
          "punctuation-finish"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 0.954,
        "actorCoverage": 0.954,
        "actionCoverage": 0.95,
        "objectCoverage": 0.875,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "building-access-rushed-mobile-under-formal-record": {
      "id": "building-access-rushed-mobile-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again",
      "donorText": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 18.78,
          "sentenceCount": 9,
          "contractionDensity": 0,
          "punctuationDensity": 0.178,
          "contentWordComplexity": 0.373,
          "modifierDensity": 0.065,
          "directness": 0.54,
          "abstractionPosture": 0.2
        }
      },
      "retrievalTrace": {
        "sourceText": "west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 18.59,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.177,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.334,
            "modifierDensity": 0.049,
            "hedgeDensity": 0.029,
            "directness": 0.54,
            "abstractionPosture": 0.272,
            "latinatePreference": 0.049,
            "recurrencePressure": 0.218
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "8:19",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "8:20",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "d3",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "118",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "west annex zzprotlitczz still fake open",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "west annex zzprotlitczz still fake open",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "west",
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
              "raw": "reader goes green + buzzes but door wont release",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "reader goes green + buzzes but door wont release",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "goes",
                  "actor": "",
                  "action": "goes",
                  "object": "green buzzes door wont release",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "first hit was like zzprotlitazz maybe zzprotlitbzz",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "first hit was like zzprotlitazz maybe zzprotlitbzz",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "like zzprotlitazz zzprotlitbzz",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                }
              ]
            },
            {
              "id": "s3",
              "raw": "courier for suite zzprotlitdzz is here w fridge meds and he cant just wait in sun",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "courier for suite zzprotlitdzz is here w fridge meds",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "",
                  "action": "is",
                  "object": "here w fridge meds",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "he cant just wait in sun",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wait",
                  "actor": "he",
                  "action": "wait",
                  "object": "sun",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s4",
              "raw": "weird part: my renewed badge fails, old temp badge worked once",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "weird part: my renewed badge fails, old temp badge worked once",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "weird",
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
              "raw": "not power i dont think",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "not power i dont think",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "power",
                  "actor": "i",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "can someone pls check controller before they keep telling me to jiggle latch again",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "can someone pls check controller before they keep telling me to jiggle latch again",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "they",
                  "action": "check",
                  "object": "controller before keep telling me",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 6,
          "contraction": 0,
          "connector": 5,
          "lineBreak": 6,
          "additive": 1,
          "contrastive": 2,
          "causal": 0,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 2,
            "causal": 0,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 8.73
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.12500000000000003,
            "modifierDensityDelta": 0.049,
            "directnessDelta": 0,
            "abstractionDelta": -0.22799999999999998,
            "latinateDelta": 0.049,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 9,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 276.824,
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
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 276.824,
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
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 190.226,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 190.226,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 190.418,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 188.918,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "West annex d3 still fake open, but reader goes green, buzzes but doorway wont release; first hit was like 8:19 maybe 8:20; courier for suite 118 is here w fridge meds and he cant just wait in sun. Weird part: my renewed badge fails, old temp badge worked once; and not power I dont think. Can someone please review controller before they keep telling me to jiggle latch again",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "check",
              "to": "review",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.938,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
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
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.3
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.045
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c0",
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
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.05
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.05
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.3
            }
          ],
          "sourceClauseCount": 8,
          "outputClauseCount": 6
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "8:19",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "8:20",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "d3",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "118",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "West annex d3 still fake open, but reader goes green, buzzes but doorway wont release; first hit was like 8:19 maybe 8:20; courier for suite 118 is here w fridge meds and he cant just wait in sun",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "West annex d3 still fake open, but reader goes green, buzzes but doorway wont release",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "goes",
                  "actor": "",
                  "action": "goes",
                  "object": "green buzzes doorway wont release",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "first hit was like 8:19 maybe 8:20",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "like 8 19 8 20",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty"
                  ]
                },
                {
                  "id": "s0c2",
                  "text": "courier for suite 118 is here w fridge meds and he cant just wait in sun",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wait",
                  "actor": "he",
                  "action": "wait",
                  "object": "sun",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Weird part: my renewed badge fails, old temp badge worked once; and not power I dont think",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Weird part: my renewed badge fails, old temp badge worked once",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "weird",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "and not power I dont think",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "power",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Can someone please review controller before they keep telling me to jiggle latch again",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Can someone please review controller before they keep telling me to jiggle latch again",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "they",
                  "action": "review",
                  "object": "controller before keep telling me",
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
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "check",
              "to": "review",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Register shift surfaced through directness.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "directness",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "check",
          "door"
        ],
        "relationInventory": [
          "additive:1",
          "causal:0",
          "clarifying:0",
          "contrastive:2",
          "resumptive:1",
          "temporal:2"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.938,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "package-handoff-formal-record-under-tangled-followup": {
      "id": "package-handoff-formal-record-under-tangled-followup",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
      "donorText": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 19.71,
          "sentenceCount": 7,
          "contractionDensity": 0.007,
          "punctuationDensity": 0.116,
          "contentWordComplexity": 0.32,
          "modifierDensity": 0.036,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 19.61,
            "sentenceCount": 11,
            "contractionDensity": 0.007,
            "punctuationDensity": 0.116,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.331,
            "modifierDensity": 0.036,
            "hedgeDensity": 0.005,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.018,
            "recurrencePressure": 0.178
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 11,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "7:06 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "18",
                "placeholder": "zzprotlitdzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitezz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitfzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitgzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "On Tuesday, March zzprotlitdzz, the rush parcel addressed to Unit zzprotlitezz was not presented for signature at the apartment door",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "On Tuesday, March zzprotlitdzz, the rush parcel addressed to Unit zzprotlitezz was not presented for signature at the apartment door",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the rush",
                  "action": "was",
                  "object": "presented signature at apartment door",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The carrier scan marked zzprotlitczz at zzprotlitazz, but building footage and resident testimony indicate no buzzer call was placed to Unit zzprotlitfzz during that minute",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The carrier scan marked zzprotlitczz at zzprotlitazz, but building footage and resident testimony indicate no buzzer call was placed to Unit zzprotlitfzz during that minute",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "call",
                  "actor": "The carrier",
                  "action": "call",
                  "object": "placed unit zzprotlitfzz during minute",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The package was instead left on the second-floor landing near the stair rail",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The package was instead left on the second-floor landing near the stair rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "The package",
                  "action": "left",
                  "object": "second floor landing near stair",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Ms",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "ms",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Chen located it at approximately zzprotlitbzz after noticing the door tag and asking maintenance whether a delivery had come through",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Chen located it at approximately zzprotlitbzz after noticing the door tag and asking maintenance whether a delivery had come through",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "located",
                  "actor": "it",
                  "action": "located",
                  "object": "at approximately zzprotlitbzz after noticing",
                  "modifiers": [
                    "approximately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "I moved the parcel from the landing to the hallway table outside zzprotlitgzz only after Ms",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "I moved the parcel from the landing to the hallway table outside zzprotlitgzz only after Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "I",
                  "action": "moved",
                  "object": "parcel from landing hallway table",
                  "modifiers": [
                    "table",
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Chen confirmed it was hers and requested help because she was already carrying groceries",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Chen confirmed it was hers and requested help",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "it",
                  "action": "confirmed",
                  "object": "hers requested help",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "she was already carrying groceries",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "she",
                  "action": "was",
                  "object": "already carrying groceries",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The outer carton remained sealed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The outer carton remained sealed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "outer",
                  "actor": "The outer",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "The red rush label remained attached",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "The red rush label remained attached",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "red",
                  "actor": "The red",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "No third party handled the parcel after pickup from the landing",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "No third party handled the parcel after pickup from the landing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "no",
                  "actor": "the parcel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "The corrective issue is not merely where the box rested",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "The corrective",
                  "action": "issue",
                  "object": "merely where box rested",
                  "modifiers": [
                    "corrective",
                    "merely"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s10c1",
                  "text": "that the signature record implies a contact attempt that the building log does not support",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "contact",
                  "actor": "that",
                  "action": "contact",
                  "object": "attempt building log support",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 10,
          "contraction": 2,
          "connector": 6,
          "lineBreak": 10,
          "additive": 3,
          "contrastive": 3,
          "causal": 1,
          "temporal": 3,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [
            "contraction"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 3,
            "contrastive": 3,
            "causal": 1,
            "temporal": 3,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 4.699999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0.007,
            "hedgeDelta": 0.005
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.032999999999999974,
            "modifierDensityDelta": 0.000999999999999994,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.017000000000000005,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 6,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 366.748,
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
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 366.748,
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
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 299.558,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 299.558,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 299.558,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 299.558,
              "passesApplied": [
                "baseline-merge",
                "baseline-contraction",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "On Tuesday, March 18, the rush parcel addressed to Unit 2B wasn't presented for signature at the apartment doorway; yet the carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer contact was placed to Unit 2B during that minute, but the package was instead left on the second-floor landing near the stair rail, but ms. Chen identified it at approximately 7:06 PM after noticing the doorway tag and asking maintenance whether a delivery had come through. I relocated the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested support because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log doesn't support.",
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
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "find",
              "from": "located",
              "to": "identified",
              "kind": "lexeme"
            },
            {
              "family": "move",
              "from": "moved",
              "to": "relocated",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.937,
          "actorCoverage": 0.929,
          "actionCoverage": 0.936,
          "objectCoverage": 0.885,
          "polarityMismatches": 1,
          "tenseMismatches": 1,
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
              "bagScore": 0.143,
              "globalBagScore": 0.044
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.75,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 0.18000000000000002,
              "actorCoverage": 0.075,
              "actionCoverage": 0.16200000000000003,
              "objectCoverage": 0.2,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.083,
              "globalBagScore": 0.021
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c1",
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
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.068
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.146
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.098
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.073
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s8c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s9c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.049
            },
            {
              "sourceClauseId": "s10c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.146
            },
            {
              "sourceClauseId": "s10c1",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.833,
              "globalBagScore": 0.122
            }
          ],
          "sourceClauseCount": 13,
          "outputClauseCount": 11
        },
        "protectedAnchorAudit": {
          "totalAnchors": 7,
          "resolvedAnchors": 7,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 11,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "7:06 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "18",
                "placeholder": "zzprotlitdzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitezz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitfzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitgzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "On Tuesday, March 18, the rush parcel addressed to Unit 2B wasn't presented for signature at the apartment doorway; yet the carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer contact was placed to Unit 2B during that minute, but the package was instead left on the second-floor landing near the stair rail, but ms",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "On Tuesday, March 18, the rush parcel addressed to Unit 2B wasn't presented for signature at the apartment doorway",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "tuesday",
                  "actor": "the rush",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "yet the carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer contact was placed to Unit 2B during that minute, but the package was instead left on the second-floor landing near the stair rail, but ms",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "contact",
                  "actor": "the carrier",
                  "action": "contact",
                  "object": "placed unit 2b during minute",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Chen identified it at approximately 7:06 PM after noticing the doorway tag and asking maintenance whether a delivery had come through",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Chen identified it at approximately 7:06 PM after noticing the doorway tag and asking maintenance whether a delivery had come through",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "identified",
                  "actor": "it",
                  "action": "identified",
                  "object": "at approximately 7 06 pm",
                  "modifiers": [
                    "approximately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "I relocated the parcel from the landing to the hallway table outside 2B only after Ms",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "I relocated the parcel from the landing to the hallway table outside 2B only after Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "relocated",
                  "actor": "I",
                  "action": "relocated",
                  "object": "parcel from landing hallway table",
                  "modifiers": [
                    "table",
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Chen confirmed it was hers and requested support because she was already carrying groceries",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Chen confirmed it was hers and requested support",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "it",
                  "action": "confirmed",
                  "object": "hers requested support",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "she was already carrying groceries",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "she",
                  "action": "was",
                  "object": "already carrying groceries",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "The outer carton remained sealed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "The outer carton remained sealed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "outer",
                  "actor": "The outer",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "The red rush label remained attached",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "The red rush label remained attached",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "red",
                  "actor": "The red",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "No third party handled the parcel after pickup from the landing",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "No third party handled the parcel after pickup from the landing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "no",
                  "actor": "the parcel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log doesn't support.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The corrective issue is not merely where the box rested",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "The corrective",
                  "action": "issue",
                  "object": "merely where box rested",
                  "modifiers": [
                    "corrective",
                    "merely"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s7c1",
                  "text": "that the signature record implies a contact attempt that the building log doesn't support",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "contact",
                  "actor": "that",
                  "action": "contact",
                  "object": "attempt building log doesn't support",
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
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "door",
              "from": "door",
              "to": "doorway",
              "kind": "lexeme"
            },
            {
              "family": "find",
              "from": "located",
              "to": "identified",
              "kind": "lexeme"
            },
            {
              "family": "move",
              "from": "moved",
              "to": "relocated",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "contraction-posture",
          "directness",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "door",
          "find",
          "move"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:0",
          "contrastive:3",
          "resumptive:0",
          "temporal:3"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [
          "contraction"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 0.937,
        "actorCoverage": 0.929,
        "actionCoverage": 0.936,
        "objectCoverage": 0.885,
        "polarityMismatches": 1,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "package-handoff-tangled-followup-under-formal-record": {
      "id": "package-handoff-tangled-followup-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
      "donorText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 14.91,
          "sentenceCount": 11,
          "contractionDensity": 0,
          "punctuationDensity": 0.11,
          "contentWordComplexity": 0.364,
          "modifierDensity": 0.035,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 15.01,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.11,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.353,
            "modifierDensity": 0.035,
            "hedgeDensity": 0.007,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.029,
            "recurrencePressure": 0.183
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 12,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Following up",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "following",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "I think yesterday's thread accidentally made it sound",
                  "relationToPrev": "resumptive",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "think",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "accidentally"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                },
                {
                  "id": "s0c2",
                  "text": "if the parcel moved through three hands before anyone could say whose it was",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "the parcel",
                  "action": "moved",
                  "object": "through three hands before anyone",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "That is not quite right",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "That is not quite right",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "That",
                  "action": "is",
                  "object": "right",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The carrier marked zzprotlitbzz at zzprotlitazz, but there was no call to zzprotlitczz that anyone can point to",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The carrier marked zzprotlitbzz at zzprotlitazz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "carrier",
                  "actor": "The carrier",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "there was no call to zzprotlitczz that anyone can point to",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "call",
                  "actor": "there",
                  "action": "call",
                  "object": "zzprotlitczz anyone point",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Ms",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "ms",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asked",
                  "actor": "the tag",
                  "action": "asked",
                  "object": "around parcel spotted second floor",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "said",
                  "actor": "I",
                  "action": "said",
                  "object": "expected rush shipment after said",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s5c1",
                  "text": "balancing groceries",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "balancing",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "So yes, the hallway table outside zzprotlitdzz is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "So yes, the hallway table outside zzprotlitdzz is where it ended up, but the actual miss happened earlier, on the landing",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "the hallway",
                  "action": "is",
                  "object": "where ended up actual miss",
                  "modifiers": [
                    "table",
                    "actual"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "the delivery record pretended the signature step had been tried",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "the delivery",
                  "action": "had",
                  "object": "tried",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 2,
          "sentenceMerge": 6,
          "contraction": 2,
          "connector": 10,
          "lineBreak": 6,
          "additive": 2,
          "contrastive": 2,
          "causal": 3,
          "temporal": 6,
          "clarifying": 1,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "contraction",
            "phrase-texture"
          ],
          "connectorStrategy": "temporal",
          "contractionStrategy": "decrease",
          "relationInventory": {
            "additive": 2,
            "contrastive": 2,
            "causal": 3,
            "temporal": 6,
            "clarifying": 1,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -4.700000000000001
          },
          "discourseGoals": {
            "contractionDelta": -0.007,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.032999999999999974,
            "modifierDensityDelta": -0.000999999999999994,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0.017,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 7,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 334.704,
            "passesApplied": [
              "contraction",
              "phrase-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "directness",
              "abstraction-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 334.704,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 311.368,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-discourse",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
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
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 311.368,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-discourse",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
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
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 311.368,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-discourse",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
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
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 311.368,
              "passesApplied": [
                "baseline-split",
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-discourse",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
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
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Following up because I think yesterday's thread accidentally made it sound as if the parcel relocated through three provides before anyone could say whose it was, that's not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no contact to 2B that anyone can detail to. Ms. Chen saw the tag, requested around, then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she explained it was the expected rush shipment and after she said she didn't want to carry another thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
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
            "directness",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "point",
              "to": "detail",
              "kind": "lexeme"
            },
            {
              "family": "ask",
              "from": "asked",
              "to": "requested",
              "kind": "lexeme"
            },
            {
              "family": "give",
              "from": "hands",
              "to": "provides",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "call",
              "to": "contact",
              "kind": "lexeme"
            },
            {
              "family": "move",
              "from": "moved",
              "to": "relocated",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.938,
          "polarityMismatches": 1,
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
              "globalBagScore": 0.026
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
              "globalBagScore": 0.053
            },
            {
              "sourceClauseId": "s0c2",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.184
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
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
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.103
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.184
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.1,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s5c1",
              "matchedClauseId": "s4c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.184
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s5c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.053
            }
          ],
          "sourceClauseCount": 12,
          "outputClauseCount": 11
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 11,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "2B",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Following up because I think yesterday's thread accidentally made it sound as if the parcel relocated through three provides before anyone could say whose it was, that's not quite right",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Following up",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "following",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "I think yesterday's thread accidentally made it sound",
                  "relationToPrev": "resumptive",
                  "clauseType": "parenthetical",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "think",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "accidentally"
                  ],
                  "hedgeMarkers": [
                    "stance"
                  ]
                },
                {
                  "id": "s0c2",
                  "text": "if the parcel relocated through three provides before anyone could say whose it was, that's not quite right",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "relocated",
                  "actor": "the parcel",
                  "action": "relocated",
                  "object": "through three provides before anyone",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no contact to 2B that anyone can detail to",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The carrier marked \"attempted / no answer\" at 6:41 PM",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "carrier",
                  "actor": "The carrier",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "there was no contact to 2B that anyone can detail to",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "contact",
                  "actor": "there",
                  "action": "contact",
                  "object": "2b anyone detail",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Ms",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "ms",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Chen saw the tag, requested around, then the parcel was spotted on the second-floor landing near the stair rail",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Chen saw the tag, requested around, then the parcel was spotted on the second-floor landing near the stair rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "requested",
                  "actor": "the tag",
                  "action": "requested",
                  "object": "around parcel spotted second floor",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "I lifted it from there only after she explained it was the expected rush shipment and after she said she didn't want to carry another thing while balancing groceries",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "I lifted it from there only after she explained it was the expected rush shipment and after she said she didn't want to carry another thing",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "said",
                  "actor": "I",
                  "action": "said",
                  "object": "didn't want carry another thing",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s4c1",
                  "text": "balancing groceries",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "balancing",
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
              "raw": "So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "the hallway",
                  "action": "is",
                  "object": "where ended up actual miss",
                  "modifiers": [
                    "table",
                    "actual"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "the delivery record pretended the signature step had been tried",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "the delivery",
                  "action": "had",
                  "object": "tried",
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
            "directness",
            "abstraction-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "point",
              "to": "detail",
              "kind": "lexeme"
            },
            {
              "family": "ask",
              "from": "asked",
              "to": "requested",
              "kind": "lexeme"
            },
            {
              "family": "give",
              "from": "hands",
              "to": "provides",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "call",
              "to": "contact",
              "kind": "lexeme"
            },
            {
              "family": "move",
              "from": "moved",
              "to": "relocated",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "6 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness, abstraction-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "directness",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "ask",
          "call",
          "detail",
          "give",
          "move",
          "say"
        ],
        "relationInventory": [
          "additive:2",
          "causal:3",
          "clarifying:1",
          "contrastive:2",
          "resumptive:1",
          "temporal:6"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
        ],
        "connectorStrategy": "temporal",
        "contractionStrategy": "decrease",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.938,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "volunteer-cleanup-professional-message-under-rushed-mobile": {
      "id": "volunteer-cleanup-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
      "donorText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 8.83,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.17,
          "contentWordComplexity": 0.231,
          "modifierDensity": 0.048,
          "directness": 0.86,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 9,
            "sentenceCount": 8,
            "contractionDensity": 0,
            "punctuationDensity": 0.17,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.247,
            "modifierDensity": 0.045,
            "hedgeDensity": 0.018,
            "directness": 0.817,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.048,
            "recurrencePressure": 0.166
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 14,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team, here is the cleanup flow for Saturday",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the cleanup",
                  "action": "is",
                  "object": "cleanup flow saturday",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "we do not lose the first hour to improvisation",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "we",
                  "action": "do",
                  "object": "lose first hour improvisation",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Please check in at the west fence table when you arrive, even if you already know the site",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Please check in at the west fence table",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "the west",
                  "action": "check",
                  "object": "at west fence table",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "you arrive, even",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "arrive",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "you already know the site",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "already",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "pull",
                  "actor": "We",
                  "action": "pull",
                  "object": "pantry post reset salvage sorting",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fixed",
                  "actor": "the fence",
                  "action": "fixed",
                  "object": "purpose shovels at fence brooms",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s3c1",
                  "text": "the wind holds",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "the wind",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Gloves, water, and closed-toe shoes are required",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Gloves, water, and closed-toe shoes are required",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "required",
                  "actor": "",
                  "action": "required",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "If you forgot any of those, tell me before you start rather than trying to work around it",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "If you forgot any of those, tell me before you start rather than trying to work around it",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "you",
                  "action": "tell",
                  "object": "me before start than trying",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Kids can help at labeling and pantry sort, but they stay clear of saws and thinner",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Kids can help at labeling and pantry sort",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "",
                  "action": "can",
                  "object": "help at labeling pantry",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "they stay clear of saws and thinner",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stay",
                  "actor": "they",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "We stop for inventory at zzprotlitazz because a clean handoff matters more than heroic freelancing.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "We stop for inventory at zzprotlitazz",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stop",
                  "actor": "We",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "a clean handoff matters more than heroic freelancing",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "clean",
                  "actor": "a clean",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "heroic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 2,
          "sentenceMerge": 7,
          "contraction": 2,
          "connector": 4,
          "lineBreak": 7,
          "additive": 5,
          "contrastive": 1,
          "causal": 2,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-lexicon",
            "connector-stance-rescue"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 5,
            "contrastive": 1,
            "causal": 2,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -7.629999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.002999999999999999
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.04899999999999999,
            "modifierDensityDelta": 0.010999999999999996,
            "directnessDelta": 0.1369999999999999,
            "abstractionDelta": 0,
            "latinateDelta": 0.0020000000000000018,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 15,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 108.402,
            "passesApplied": [
              "baseline-split",
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
              "connector-stance",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Structural opportunity existed but the current candidate collapsed into additive drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": -0.778,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "contraction-posture",
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 108.402,
              "passesApplied": [
                "baseline-split",
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
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "split-heavy",
              "score": 108.402,
              "passesApplied": [
                "baseline-split",
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
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 108.402,
              "passesApplied": [
                "baseline-split",
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
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": 108.402,
              "passesApplied": [
                "baseline-split",
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
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Team, here is the cleanup flow for Saturday. So we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive. Even if you already know the site. We are kicking off with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose. Shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required, if you forgot any of those, tell me before you kick off rather than trying to work around it. Kids can help at labeling and pantry sort,. But they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "starting",
              "to": "kicking off",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "connector-stance-rescue",
            "partial-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.968,
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
              "globalBagScore": 0.079
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.105
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.132
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s1c2",
              "matchedClauseId": "s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.158
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s5c0+s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.105
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s9c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s10c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s7c1",
              "matchedClauseId": "s10c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.053
            }
          ],
          "sourceClauseCount": 14,
          "outputClauseCount": 16
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 11,
            "clauseCount": 16,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team, here is the cleanup flow for Saturday",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team, here is the cleanup flow for Saturday",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the cleanup",
                  "action": "is",
                  "object": "cleanup flow saturday",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "So we do not lose the first hour to improvisation",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "So we do not lose the first hour to improvisation",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "we",
                  "action": "do",
                  "object": "lose first hour improvisation",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Please check in at the west fence table when you arrive",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Please check in at the west fence table",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "the west",
                  "action": "check",
                  "object": "at west fence table",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "you arrive",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "arrive",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Even if you already know the site",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Even",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "even",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "you already know the site",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "already",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "We are kicking off with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "We are kicking off with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "pull",
                  "actor": "We",
                  "action": "pull",
                  "object": "pantry post reset salvage sorting",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Tool lanes are fixed on purpose",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Tool lanes are fixed on purpose",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fixed",
                  "actor": "",
                  "action": "fixed",
                  "object": "purpose",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Shovels at the fence, brooms at the tarp, saws under canopy B, and paint only",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "shovels",
                  "actor": "the fence",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s6c1",
                  "text": "the wind holds",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "the wind",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Gloves, water, and closed-toe shoes are required, if you forgot any of those, tell me before you kick off rather than trying to work around it",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Gloves, water, and closed-toe shoes are required",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "required",
                  "actor": "",
                  "action": "required",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "you forgot any of those, tell me before you kick off rather than trying to work around it",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "you",
                  "action": "tell",
                  "object": "me before kick off than",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Kids can help at labeling and pantry sort,",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Kids can help at labeling and pantry sort,",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "",
                  "action": "can",
                  "object": "help at labeling pantry",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "But they stay clear of saws and thinner",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "But they stay clear of saws and thinner",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stay",
                  "actor": "they",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "We stop for inventory at 10:15",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stop",
                  "actor": "We",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s10c1",
                  "text": "a clean handoff matters more than heroic freelancing",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "clean",
                  "actor": "a clean",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "heroic"
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
            "sentence-spread",
            "connector-stance",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "starting",
              "to": "kicking off",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "connector-stance-rescue",
            "partial-rescue"
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
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "start"
        ],
        "relationInventory": [
          "additive:5",
          "causal:2",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:2"
        ],
        "structuralOperations": [
          "baseline-split",
          "clause-join-split",
          "planned-sentence-split",
          "sentence-structure"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-lexicon",
          "connector-stance-rescue"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.968,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "volunteer-cleanup-rushed-mobile-under-professional-message": {
      "id": "volunteer-cleanup-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
      "donorText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 16.63,
          "sentenceCount": 8,
          "contractionDensity": 0,
          "punctuationDensity": 0.18,
          "contentWordComplexity": 0.296,
          "modifierDensity": 0.034,
          "directness": 0.68,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 16.46,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.18,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.28,
            "modifierDensity": 0.037,
            "hedgeDensity": 0.016,
            "directness": 0.723,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.046,
            "recurrencePressure": 0.21
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "if youre late thats ok just dont start random jobs",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "if youre late thats ok just dont start random jobs",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "youre",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "check in west fence table first",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "check in west fence table first",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "",
                  "action": "check",
                  "object": "west fence table first",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "glass + pallets first pass",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "glass + pallets first pass",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "glass",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "saws stay under canopy b, kids stay off solvent side, paint only",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "saws",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s3c1",
                  "text": "wind chills out",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "zzprotlitazz inventory stop still stands",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "zzprotlitazz inventory stop still stands",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "zzprotlitazz",
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
              "raw": "pls bring water for real, not saying it to be annoying",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "pls bring water for real, not saying it to be annoying",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "it",
                  "action": "bring",
                  "object": "water real saying annoying",
                  "modifiers": [
                    "real"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 5,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 5,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 7.630000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": -0.002999999999999999
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.049000000000000016,
            "modifierDensityDelta": -0.011000000000000003,
            "directnessDelta": -0.137,
            "abstractionDelta": 0,
            "latinateDelta": -0.0020000000000000018,
            "registerMode": "operational"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 8,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 308.958,
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
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 308.958,
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
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 312.414,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 312.414,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 312.414,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 312.414,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "If youre late thats ok just dont begin random jobs, and review in west fence table first. Glass, pallets first pass; and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying.",
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
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "check",
              "to": "review",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.964,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
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
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.267
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.071
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.071
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
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c0",
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
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.357
            }
          ],
          "sourceClauseCount": 7,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "If youre late thats ok just dont begin random jobs, and review in west fence table first",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "If youre late thats ok just dont begin random jobs, and review in west fence table first",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "begin",
                  "actor": "",
                  "action": "begin",
                  "object": "random jobs review west fence",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Glass, pallets first pass; and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Glass, pallets first pass",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "glass",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "saws",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "it",
                  "action": "bring",
                  "object": "water real saying annoying",
                  "modifiers": [
                    "real"
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
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "check",
              "to": "review",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "directness",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "check",
          "start"
        ],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.964,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "clinic-scheduling-professional-message-under-tangled-followup": {
      "id": "clinic-scheduling-professional-message-under-tangled-followup",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Hi team, I am documenting why the MRI for the left knee is still not scheduled even though the patient was told the authorization had cleared. The payer line confirmed auth number PR-44719, but their record is tied to the downtown clinic while the order in our queue still points to North River. Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan. We sent the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback. If the ordering office can resend under the correct location today, we may still keep the next-day slot. Otherwise the case rolls again.",
      "donorText": "Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time. I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be held indefinitely. I am not confused about whether an authorization exists. I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 20,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.1,
          "contentWordComplexity": 0.336,
          "modifierDensity": 0.093,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Hi team, I am documenting why the MRI for the left knee is still not scheduled even though the patient was told the authorization had cleared. The payer line confirmed auth number PR-44719, but their record is tied to the downtown clinic while the order in our queue still points to North River. Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan. We sent the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback. If the ordering office can resend under the correct location today, we may still keep the next-day slot. Otherwise the case rolls again.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 20.03,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.1,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.338,
            "modifierDensity": 0.081,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.031,
            "recurrencePressure": 0.187
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "10:26 AM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "3:44 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "MRI",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "PR-44719",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hi team, I am documenting why the zzprotlitczz for the left knee is still not scheduled even though the patient was told the authorization had cleared",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hi team, I am documenting why the zzprotlitczz for the left knee is still not scheduled",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "progressive",
                  "propositionHead": "left",
                  "actor": "I",
                  "action": "left",
                  "object": "knee scheduled",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "the patient was told the authorization had cleared",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "told",
                  "actor": "the patient",
                  "action": "told",
                  "object": "authorization cleared",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The payer line confirmed auth number zzprotlitdzz, but their record is tied to the downtown clinic while the order in our queue still points to North River",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The payer line confirmed auth number zzprotlitdzz, but their record is tied to the downtown clinic",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The payer",
                  "action": "confirmed",
                  "object": "auth number zzprotlitdzz record tied",
                  "modifiers": [
                    "clinic"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the order in our queue still points to North River",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "order",
                  "actor": "the order",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "negative",
                  "tenseAspect": "future-modal",
                  "propositionHead": "match",
                  "actor": "the site",
                  "action": "match",
                  "object": "scheduling see approval cannot legally",
                  "modifiers": [
                    "approval",
                    "legally"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We sent the correction request at zzprotlitazz and were still waiting on a reissued order at the zzprotlitbzz callback",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We sent the correction request at zzprotlitazz and were still waiting on a reissued order at the zzprotlitbzz callback",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "sent",
                  "actor": "We",
                  "action": "sent",
                  "object": "correction request at zzprotlitazz waiting",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "If the ordering office can resend under the correct location today, we may still keep the next-day slot",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "If the ordering office can resend under the correct location today, we may still keep the next-day slot",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "keep",
                  "actor": "the ordering",
                  "action": "keep",
                  "object": "next day slot",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Otherwise the case rolls again.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Otherwise the case rolls again",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "otherwise",
                  "actor": "the case",
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
          "sentenceMerge": 5,
          "contraction": 3,
          "connector": 9,
          "lineBreak": 5,
          "additive": 3,
          "contrastive": 7,
          "causal": 1,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 5
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "contraction",
            "phrase-texture"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 7,
            "causal": 1,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 5
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -1.2999999999999972
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.0050000000000000044,
            "modifierDensityDelta": 0.038000000000000006,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.026000000000000002,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 1,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 273.026,
            "passesApplied": [
              "contraction",
              "phrase-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "directness",
              "abstraction-posture"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 273.026,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 240.082,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 241.214,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 240.082,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 240.082,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hi team, I'm documenting why the MRI for the left knee is still not scheduled even though the patient was explained the authorization had cleared. The payer line confirmed authorization number PR-44719, but their record is tied to the downtown clinic while the order in our queue still details to North River, because the site on the authorization and the site on the order don't align, scheduling can see the approval and still can't legally schedule the scan. We forwarded the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback, if the ordering office can resend under the correct location today, we may still retain the next-day slot. Otherwise the case rolls again.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness",
            "abstraction-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "told",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "keep",
              "from": "keep",
              "to": "retain",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "points",
              "to": "details",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "sent",
              "to": "forwarded",
              "kind": "lexeme"
            },
            {
              "family": "match",
              "from": "match",
              "to": "align",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.875,
          "actorCoverage": 1,
          "actionCoverage": 0.864,
          "objectCoverage": 0.798,
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
              "globalBagScore": 0.088
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 0.9,
              "actorCoverage": 1,
              "actionCoverage": 0.81,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.6,
              "globalBagScore": 0.086
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.455,
              "globalBagScore": 0.135
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
              "globalBagScore": 0.029
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.75,
              "globalBagScore": 0.171
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.111
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 0.1,
              "actorCoverage": 1,
              "actionCoverage": 0.1,
              "objectCoverage": 0.082,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.059
            }
          ],
          "sourceClauseCount": 8,
          "outputClauseCount": 8
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "10:26 AM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "3:44 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "MRI",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "PR-44719",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hi team, I'm documenting why the MRI for the left knee is still not scheduled even though the patient was explained the authorization had cleared",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hi team, I'm documenting why the MRI for the left knee is still not scheduled",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "left",
                  "actor": "I",
                  "action": "left",
                  "object": "knee scheduled",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "the patient was explained the authorization had cleared",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "was",
                  "actor": "the patient",
                  "action": "was",
                  "object": "explained authorization cleared",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The payer line confirmed authorization number PR-44719, but their record is tied to the downtown clinic while the order in our queue still details to North River",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The payer line confirmed authorization number PR-44719, but their record is tied to the downtown clinic",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The payer",
                  "action": "confirmed",
                  "object": "authorization number pr 44719 record",
                  "modifiers": [
                    "clinic"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the order in our queue still details to North River",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "order",
                  "actor": "the order",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Because the site on the authorization and the site on the order don't align, scheduling can see the approval and still can't legally schedule the scan",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Because the site on the authorization and the site on the order don't align, scheduling can see the approval and still can't legally schedule the scan",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "negative",
                  "tenseAspect": "future-modal",
                  "propositionHead": "align",
                  "actor": "the site",
                  "action": "align",
                  "object": "scheduling see approval can't legally",
                  "modifiers": [
                    "approval",
                    "legally"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We forwarded the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We forwarded the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "forwarded",
                  "actor": "We",
                  "action": "forwarded",
                  "object": "correction request at 10 26",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "If the ordering office can resend under the correct location today, we may still retain the next-day slot",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "If the ordering office can resend under the correct location today, we may still retain the next-day slot",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "the ordering",
                  "action": "can",
                  "object": "resend under correct location today",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Otherwise the case rolls again.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Otherwise the case rolls again",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "otherwise",
                  "actor": "the case",
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
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness",
            "abstraction-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "told",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "keep",
              "from": "keep",
              "to": "retain",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "points",
              "to": "details",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "sent",
              "to": "forwarded",
              "kind": "lexeme"
            },
            {
              "family": "match",
              "from": "match",
              "to": "align",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "5 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness, abstraction-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "directness",
          "lexical-register"
        ],
        "lexemeSwapFamilies": [
          "detail",
          "keep",
          "match",
          "say",
          "send"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:0",
          "contrastive:7",
          "resumptive:5",
          "temporal:1"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 0.875,
        "actorCoverage": 1,
        "actionCoverage": 0.864,
        "objectCoverage": 0.798,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "clinic-scheduling-tangled-followup-under-professional-message": {
      "id": "clinic-scheduling-tangled-followup-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time. I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be held indefinitely. I am not confused about whether an authorization exists. I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
      "donorText": "Hi team, I am documenting why the MRI for the left knee is still not scheduled even though the patient was told the authorization had cleared. The payer line confirmed auth number PR-44719, but their record is tied to the downtown clinic while the order in our queue still points to North River. Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan. We sent the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback. If the ordering office can resend under the correct location today, we may still keep the next-day slot. Otherwise the case rolls again.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 21.33,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.109,
          "contentWordComplexity": 0.343,
          "modifierDensity": 0.043,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time. I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be held indefinitely. I am not confused about whether an authorization exists. I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 21.3,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.109,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.341,
            "modifierDensity": 0.055,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.049,
            "recurrencePressure": 0.177
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "10:26 AM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "PR-44719",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Trying one more time",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "trying",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "each person I speak with describes the same blockage",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "each",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "if it lives somewhere else",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "lives",
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
              "raw": "The portal notice made it sound finished",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The portal notice made it sound finished",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "The portal",
                  "action": "finished",
                  "object": "",
                  "modifiers": [
                    "portal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The payer line confirmed zzprotlitbzz, so that sounded finished too",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The payer line confirmed zzprotlitbzz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The payer",
                  "action": "confirmed",
                  "object": "zzprotlitbzz",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "that sounded finished too",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "that",
                  "action": "finished",
                  "object": "too",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Scheduling then said the approval could not be used",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "said",
                  "actor": "the approval",
                  "action": "said",
                  "object": "approval used",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "it points to the downtown clinic",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "points",
                  "actor": "it",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "clinic"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c2",
                  "text": "the actual order still says North River, which means the approval is real and unusable at the same time",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "says",
                  "actor": "the actual",
                  "action": "says",
                  "object": "north river which means approval",
                  "modifiers": [
                    "actual",
                    "approval",
                    "real",
                    "unusable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "I was told a corrected order request went out at zzprotlitazz, then told to wait for a callback, then told the next-day slot could not be held indefinitely",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "I was told a corrected order request went out at zzprotlitazz, then told to wait for a callback, then told the next-day slot could not be held indefinitely",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "told",
                  "actor": "I",
                  "action": "told",
                  "object": "corrected order request went out",
                  "modifiers": [
                    "indefinitely"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "I am not confused about whether an authorization exists",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "I am not confused about whether an authorization exists",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "confused about whether authorization exists",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "I am confused about why an approved case can sit in limbo all day",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "confused about why approved case",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "no one owns the location mismatch long enough to close it",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "no",
                  "actor": "the location",
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
          "sentenceSplit": 1,
          "sentenceMerge": 6,
          "contraction": 2,
          "connector": 11,
          "lineBreak": 6,
          "additive": 1,
          "contrastive": 1,
          "causal": 5,
          "temporal": 4,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "contraction",
            "phrase-texture"
          ],
          "connectorStrategy": "causal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 1,
            "causal": 5,
            "temporal": 4,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 1.3000000000000007
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.0050000000000000044,
            "modifierDensityDelta": -0.038,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0.026000000000000002,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 1,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 337.36,
            "passesApplied": [
              "contraction",
              "phrase-texture"
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
              "score": 337.36,
              "passesApplied": [
                "contraction",
                "phrase-texture"
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
              "spec": "mixed-structural",
              "score": -10.918,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "merge-heavy",
              "score": -10.918,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": -10.918,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": -10.918,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Trying another time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then explained the approval could not be used because it details to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time, and I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be retained indefinitely. I'm not confused about whether an authorization exists. I'm confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
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
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "keep",
              "from": "held",
              "to": "retained",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "points",
              "to": "details",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.923,
          "polarityMismatches": 1,
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
              "globalBagScore": 0.031
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
              "globalBagScore": 0.031
            },
            {
              "sourceClauseId": "s0c2",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.031
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
              "globalBagScore": 0.063
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.4,
              "globalBagScore": 0.061
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.063
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0+s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.2,
              "globalBagScore": 0.094
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0.063
            },
            {
              "sourceClauseId": "s3c2",
              "matchedClauseId": "s2c1+s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 1,
              "bagScore": 0.25,
              "globalBagScore": 0.139
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.219
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s4c0",
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
              "sourceClauseId": "s6c0",
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
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s5c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.063
            }
          ],
          "sourceClauseCount": 13,
          "outputClauseCount": 11
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 11,
            "literalSpans": [
              {
                "value": "10:26 AM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "PR-44719",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Trying another time because each person I speak with describes the same blockage as if it lives somewhere else",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Trying another time",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "trying",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "each person I speak with describes the same blockage",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "each",
                  "actor": "I",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "if it lives somewhere else",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "lives",
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
              "raw": "The portal notice made it sound finished",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The portal notice made it sound finished",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "The portal",
                  "action": "finished",
                  "object": "",
                  "modifiers": [
                    "portal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The payer line confirmed PR-44719, so that sounded finished too",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The payer line confirmed PR-44719",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The payer",
                  "action": "confirmed",
                  "object": "pr 44719",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "that sounded finished too",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "that",
                  "action": "finished",
                  "object": "too",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Scheduling then explained the approval could not be used because it details to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time, and I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be retained indefinitely",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Scheduling then explained the approval could not be used because it details to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "used",
                  "actor": "the approval",
                  "action": "used",
                  "object": "details downtown clinic actual order",
                  "modifiers": [
                    "approval",
                    "clinic",
                    "actual",
                    "approval",
                    "real",
                    "unusable"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be retained indefinitely",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "told",
                  "actor": "I",
                  "action": "told",
                  "object": "corrected order request went out",
                  "modifiers": [
                    "indefinitely"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "I'm not confused about whether an authorization exists",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "I'm not confused about whether an authorization exists",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
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
              "id": "s5",
              "raw": "I'm confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "I'm confused about why an approved case can sit in limbo all day",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "can",
                  "actor": "I",
                  "action": "can",
                  "object": "sit limbo all day",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "no one owns the location mismatch long enough to close it",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "no",
                  "actor": "the location",
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
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "keep",
              "from": "held",
              "to": "retained",
              "kind": "lexeme"
            },
            {
              "family": "detail",
              "from": "points",
              "to": "details",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, abstraction-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "detail",
          "keep",
          "say"
        ],
        "relationInventory": [
          "additive:1",
          "causal:5",
          "clarifying:0",
          "contrastive:1",
          "resumptive:1",
          "temporal:4"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
        ],
        "connectorStrategy": "causal",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.923,
        "polarityMismatches": 1,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "committee-budget-formal-record-under-tangled-followup": {
      "id": "committee-budget-formal-record-under-tangled-followup",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
      "donorText": "I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a \"service adjustment,\" which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 20,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.093,
          "contentWordComplexity": 0.437,
          "modifierDensity": 0.06,
          "directness": 0.18,
          "abstractionPosture": 0.333
        }
      },
      "retrievalTrace": {
        "sourceText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 20,
            "sentenceCount": 8,
            "contractionDensity": 0,
            "punctuationDensity": 0.094,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.448,
            "modifierDensity": 0.058,
            "hedgeDensity": 0.011,
            "directness": 0.137,
            "abstractionPosture": 0.373,
            "latinatePreference": 0.037,
            "recurrencePressure": 0.119
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 9,
            "literalSpans": [
              {
                "value": "4:05 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "Q3",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The finance committee met at zzprotlitazz to review the bridge budget after central administration extended the hiring freeze through zzprotlitbzz",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The finance committee met at zzprotlitazz to review the bridge budget after central administration extended the hiring freeze through zzprotlitbzz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "The finance",
                  "action": "review",
                  "object": "bridge budget after central administration",
                  "modifiers": [
                    "central"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The immediate",
                  "action": "is",
                  "object": "student support coordinator line remains",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the underlying service demand has not eased",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "the underlying",
                  "action": "has",
                  "object": "eased",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "can",
                  "actor": "that",
                  "action": "can",
                  "object": "absorb temporary delay furniture print",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "were",
                  "actor": "",
                  "action": "were",
                  "object": "discussed reclassify one vacant analyst",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "No option was adopted in session",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "No option was adopted in session",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "adopted session",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "What did resolve was the frame: this is not a generic belt-tightening exercise",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "What did resolve was the frame: this is not a generic belt-tightening exercise",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "resolve",
                  "actor": "the frame",
                  "action": "resolve",
                  "object": "frame generic belt tightening exercise",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "needs",
                  "actor": "It",
                  "action": "needs",
                  "object": "say without overstating certainty",
                  "modifiers": [
                    "public"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "pause",
                  "actor": "a staffing",
                  "action": "pause",
                  "object": "from actual service reduction",
                  "modifiers": [
                    "table",
                    "actual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 4,
          "sentenceMerge": 7,
          "contraction": 1,
          "connector": 7,
          "lineBreak": 7,
          "additive": 3,
          "contrastive": 2,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "rebalance",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "contraction",
            "phrase-texture"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 2,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 0
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.011
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.035999999999999976,
            "modifierDensityDelta": 0.006000000000000005,
            "directnessDelta": 0.137,
            "abstractionDelta": -0.127,
            "latinateDelta": -0.041,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 247.701,
            "passesApplied": [
              "contraction",
              "phrase-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "directness"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 247.701,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 141.552,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 141.552,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 216.363,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-help coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did help was the frame: this is not a generic belt-tightening exercise. It's a staffing exposure problem with public-facing consequences, and the next memo needs to tell that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "say",
              "to": "tell",
              "kind": "lexeme"
            },
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "fix",
              "from": "resolve",
              "to": "fix",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
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
              "globalBagScore": 0.149
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
              "globalBagScore": 0.128
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
              "globalBagScore": 0.043
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
              "globalBagScore": 0.106
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.043
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.149
            }
          ],
          "sourceClauseCount": 9,
          "outputClauseCount": 9
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 9,
            "literalSpans": [
              {
                "value": "4:05 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "Q3",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze through Q3",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze through Q3",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "check",
                  "actor": "The finance",
                  "action": "check",
                  "object": "bridge budget after central administration",
                  "modifiers": [
                    "central"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The immediate effect is that the student-help coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The immediate effect is that the student-help coordinator line remains unfunded for another twelve weeks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The immediate",
                  "action": "is",
                  "object": "student help coordinator line remains",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the underlying service demand has not eased",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "the underlying",
                  "action": "has",
                  "object": "eased",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "can",
                  "actor": "that",
                  "action": "can",
                  "object": "absorb temporary delay furniture print",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "were",
                  "actor": "",
                  "action": "were",
                  "object": "discussed reclassify one vacant analyst",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "No option was adopted in session",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "No option was adopted in session",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "adopted session",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "What did fix was the frame: this is not a generic belt-tightening exercise",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "What did fix was the frame: this is not a generic belt-tightening exercise",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "fix",
                  "actor": "the frame",
                  "action": "fix",
                  "object": "frame generic belt tightening exercise",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "It's a staffing exposure problem with public-facing consequences, and the next memo needs to tell that without overstating certainty",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "It's a staffing exposure problem with public-facing consequences, and the next memo needs to tell that without overstating certainty",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "needs",
                  "actor": "It",
                  "action": "needs",
                  "object": "tell without overstating certainty",
                  "modifiers": [
                    "public"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "pause",
                  "actor": "a staffing",
                  "action": "pause",
                  "object": "from actual service reduction",
                  "modifiers": [
                    "table",
                    "actual"
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
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "say",
              "to": "tell",
              "kind": "lexeme"
            },
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "fix",
              "from": "resolve",
              "to": "fix",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "4 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "contraction-posture",
          "directness",
          "lexical-register"
        ],
        "lexemeSwapFamilies": [
          "check",
          "fix",
          "help",
          "say"
        ],
        "relationInventory": [
          "additive:3",
          "causal:0",
          "clarifying:0",
          "contrastive:2",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
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
    "committee-budget-tangled-followup-under-formal-record": {
      "id": "committee-budget-tangled-followup-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a \"service adjustment,\" which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.",
      "donorText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 20,
          "sentenceCount": 8,
          "contractionDensity": 0,
          "punctuationDensity": 0.15,
          "contentWordComplexity": 0.484,
          "modifierDensity": 0.052,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a \"service adjustment,\" which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 20,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.149,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.473,
            "modifierDensity": 0.054,
            "hedgeDensity": 0.014,
            "directness": 0.043,
            "abstractionPosture": 0.46,
            "latinatePreference": 0.065,
            "recurrencePressure": 0.173
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 10,
            "literalSpans": [
              {
                "value": "\"service adjustment,\"",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "Q3",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I want to revise one phrase from my earlier recap before it starts hardening into the story",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I want to revise one phrase from my earlier recap before it starts hardening into the story",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "want",
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
              "raw": "I wrote that the committee was considering a zzprotlitazz which is technically true in the narrow memo sense and misleading in the lived one",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I wrote that the committee was considering a zzprotlitazz which is technically true in the narrow memo sense and misleading in the lived one",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "was",
                  "actor": "I",
                  "action": "was",
                  "object": "considering zzprotlitazz which technically true",
                  "modifiers": [
                    "technically"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "What the table actually showed is that if the hiring freeze runs through zzprotlitbzz, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "What the table actually showed is that",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "showed",
                  "actor": "the table",
                  "action": "showed",
                  "object": "",
                  "modifiers": [
                    "table",
                    "actually"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "the hiring freeze runs through zzprotlitbzz, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "gets",
                  "actor": "the hiring",
                  "action": "gets",
                  "object": "redistributed badly evening hours shrink",
                  "modifiers": [
                    "badly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Those are not abstract efficiencies",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Those are not abstract efficiencies",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "",
                  "action": "are",
                  "object": "abstract efficiencies",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "They are service consequences",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "They are service consequences",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "They",
                  "action": "are",
                  "object": "service consequences",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "use",
                  "actor": "we",
                  "action": "use",
                  "object": "analyst line reduced evening coverage",
                  "modifiers": [
                    "provisional"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "finance confirms the rule and the dean signs off",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "confirms",
                  "actor": "the rule",
                  "action": "confirms",
                  "object": "rule dean signs off",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "But I do not want the language to get gentler than the problem just",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "get",
                  "actor": "I",
                  "action": "get",
                  "object": "gentler than problem",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s6c1",
                  "text": "we are waiting for the Thursday table",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "are",
                  "actor": "we",
                  "action": "are",
                  "object": "waiting thursday table",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 6,
          "contraction": 4,
          "connector": 7,
          "lineBreak": 6,
          "additive": 3,
          "contrastive": 2,
          "causal": 1,
          "temporal": 1,
          "clarifying": 1,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "rebalance",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 2,
            "causal": 1,
            "temporal": 1,
            "clarifying": 1,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 0
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.035999999999999976,
            "modifierDensityDelta": -0.005999999999999998,
            "directnessDelta": -0.137,
            "abstractionDelta": 0.127,
            "latinateDelta": 0.041,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 222.052,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "contraction-posture",
              "connector-stance",
              "abstraction-posture"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 222.052,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "contraction-posture",
                "connector-stance",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 199.974,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 199.974,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 198.072,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "abstraction-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I want to revise one phrase from my earlier recap before it begins hardening into the account. I wrote that the committee was considering a \"service adjustment,\" that's technically true in the narrow memo sense and misleading in the lived one. What the table actually explained is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either receives redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to receive gentler than the problem just because we are waiting for the Thursday table.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "contraction-posture",
            "connector-stance",
            "abstraction-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "get",
              "from": "gets",
              "to": "receives",
              "kind": "lexeme"
            },
            {
              "family": "start",
              "from": "starts",
              "to": "begins",
              "kind": "lexeme"
            },
            {
              "family": "show",
              "from": "showed",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "story",
              "from": "story",
              "to": "account",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.99,
          "actorCoverage": 1,
          "actionCoverage": 0.981,
          "objectCoverage": 0.915,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s6c0+s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.125,
              "globalBagScore": 0.029
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.25,
              "globalBagScore": 0.054
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 0.9,
              "actorCoverage": 1,
              "actionCoverage": 0.81,
              "objectCoverage": 0.9,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.029
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.286,
              "globalBagScore": 0.108
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.059
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.059
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.206
            },
            {
              "sourceClauseId": "s5c1",
              "matchedClauseId": "s5c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.147
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.086
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.088
            }
          ],
          "sourceClauseCount": 10,
          "outputClauseCount": 10
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 10,
            "literalSpans": [
              {
                "value": "\"service adjustment,\"",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "Q3",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I want to revise one phrase from my earlier recap before it begins hardening into the account",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I want to revise one phrase from my earlier recap before it begins hardening into the account",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "begins",
                  "actor": "I",
                  "action": "begins",
                  "object": "hardening into account",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "I wrote that the committee was considering a \"service adjustment,\" that's technically true in the narrow memo sense and misleading in the lived one",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "I wrote that the committee was considering a \"service adjustment,\" that's technically true in the narrow memo sense and misleading in the lived one",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "was",
                  "actor": "I",
                  "action": "was",
                  "object": "considering service adjustment that's technically",
                  "modifiers": [
                    "technically"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "What the table actually explained is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either receives redistributed badly or evening hours shrink",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "What the table actually explained is that",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "the table",
                  "action": "is",
                  "object": "",
                  "modifiers": [
                    "table",
                    "actually"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either receives redistributed badly or evening hours shrink",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "hiring",
                  "actor": "the hiring",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "badly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Those are not abstract efficiencies",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Those are not abstract efficiencies",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "",
                  "action": "are",
                  "object": "abstract efficiencies",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "They are service consequences",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "They are service consequences",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "They",
                  "action": "are",
                  "object": "service consequences",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "use",
                  "actor": "we",
                  "action": "use",
                  "object": "analyst line reduced evening coverage",
                  "modifiers": [
                    "provisional"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "finance confirms the rule and the dean signs off",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "confirms",
                  "actor": "the rule",
                  "action": "confirms",
                  "object": "rule dean signs off",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "But I do not want the language to receive gentler than the problem just because we are waiting for the Thursday table.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "But I do not want the language to receive gentler than the problem just",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "I",
                  "action": "do",
                  "object": "want language receive gentler than",
                  "modifiers": [
                    "receive"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s6c1",
                  "text": "we are waiting for the Thursday table",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "are",
                  "actor": "we",
                  "action": "are",
                  "object": "waiting thursday table",
                  "modifiers": [
                    "table"
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
            "contraction-posture",
            "connector-stance",
            "abstraction-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "get",
              "from": "gets",
              "to": "receives",
              "kind": "lexeme"
            },
            {
              "family": "start",
              "from": "starts",
              "to": "begins",
              "kind": "lexeme"
            },
            {
              "family": "show",
              "from": "showed",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "story",
              "from": "story",
              "to": "account",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "4 lexical family swaps landed.",
            "Register shift surfaced through abstraction-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "contraction-posture"
        ],
        "lexemeSwapFamilies": [
          "get",
          "show",
          "start",
          "story"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:1",
          "contrastive:2",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 0.99,
        "actorCoverage": 1,
        "actionCoverage": 0.981,
        "objectCoverage": 0.915,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "overwork-debrief-professional-message-under-tangled-followup": {
      "id": "overwork-debrief-professional-message-under-tangled-followup",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness.",
      "donorText": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 22.33,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.09,
          "contentWordComplexity": 0.371,
          "modifierDensity": 0.114,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 22.31,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.09,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.371,
            "modifierDensity": 0.096,
            "hedgeDensity": 0,
            "directness": 0.156,
            "abstractionPosture": 0.333,
            "latinatePreference": 0.044,
            "recurrencePressure": 0.229
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 11,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I owe you a cleaner explanation for why the memo landed late",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I owe you a cleaner explanation for why the memo landed late",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "owe",
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
              "raw": "It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "It was not one giant emergency so much",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "one giant emergency much",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "a stack of small revision asks that kept sounding manageable long after they stopped being that",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asks",
                  "actor": "a stack",
                  "action": "asks",
                  "object": "kept sounding manageable long after",
                  "modifiers": [
                    "manageable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "What began",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "began",
                  "actor": "",
                  "action": "began",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "a Friday",
                  "action": "review",
                  "object": "cycle across saturday",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c2",
                  "text": "each extra ask arrived",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "ask",
                  "actor": "",
                  "action": "ask",
                  "object": "arrived",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c3",
                  "text": "if it were the last one",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "were",
                  "actor": "it",
                  "action": "were",
                  "object": "last one",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "have",
                  "actor": "I",
                  "action": "have",
                  "object": "named capacity limit earlier instead",
                  "modifiers": [
                    "privately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "The memo itself is now in good shape, but the route we took to get there was not",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "The memo itself is now in good shape, but the route we took to get there was not",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "get",
                  "actor": "The memo",
                  "action": "get",
                  "object": "there",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "For the next round I would like us to define a stop point before weekend work starts presenting itself",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "would",
                  "actor": "the next",
                  "action": "would",
                  "object": "like us define stop point",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "thoughtfulness",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "thoughtfulness",
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
          "sentenceMerge": 5,
          "contraction": 3,
          "connector": 9,
          "lineBreak": 5,
          "additive": 1,
          "contrastive": 2,
          "causal": 6,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-function-word",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "causal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 2,
            "causal": 6,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 0.9800000000000004
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.0020000000000000018,
            "modifierDensityDelta": 0.058,
            "directnessDelta": 0.076,
            "abstractionDelta": 0,
            "latinateDelta": -0.019000000000000003,
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
            "spec": "mixed-structural",
            "score": 208.844,
            "passesApplied": [
              "baseline-voice-realization",
              "baseline-function-word",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "connector-stance",
              "lexical-register",
              "directness"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 187.072,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 208.844,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 208.844,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 208.844,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 208.844,
              "passesApplied": [
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much because a stack of small revision asks that kept sounding manageable long after they stopped being that. What began because a Friday afternoon tone pass turned into table cleanup, citation repair, and another full check cycle across Saturday because each extra ask arrived because if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop detail before weekend work starts presenting itself because thoughtfulness.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "connector-stance",
            "lexical-register",
            "directness"
          ],
          "lexemeSwaps": [
            {
              "family": "detail",
              "from": "point",
              "to": "detail",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
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
              "globalBagScore": 0.027
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
              "globalBagScore": 0.108
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
              "globalBagScore": 0.189
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
              "globalBagScore": 0.027
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.162
            },
            {
              "sourceClauseId": "s2c2",
              "matchedClauseId": "s2c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.054
            },
            {
              "sourceClauseId": "s2c3",
              "matchedClauseId": "s2c3",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.054
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.162
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.081
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.162
            },
            {
              "sourceClauseId": "s5c1",
              "matchedClauseId": "s5c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.027
            }
          ],
          "sourceClauseCount": 11,
          "outputClauseCount": 11
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 11,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I owe you a cleaner explanation for why the memo landed late",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I owe you a cleaner explanation for why the memo landed late",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "owe",
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
              "raw": "It was not one giant emergency so much because a stack of small revision asks that kept sounding manageable long after they stopped being that",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "It was not one giant emergency so much",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "one giant emergency much",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "a stack of small revision asks that kept sounding manageable long after they stopped being that",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asks",
                  "actor": "a stack",
                  "action": "asks",
                  "object": "kept sounding manageable long after",
                  "modifiers": [
                    "manageable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "What began because a Friday afternoon tone pass turned into table cleanup, citation repair, and another full check cycle across Saturday because each extra ask arrived because if it were the last one",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "What began",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "began",
                  "actor": "",
                  "action": "began",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "a Friday afternoon tone pass turned into table cleanup, citation repair, and another full check cycle across Saturday",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "check",
                  "actor": "a Friday",
                  "action": "check",
                  "object": "cycle across saturday",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c2",
                  "text": "each extra ask arrived",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "ask",
                  "actor": "",
                  "action": "ask",
                  "object": "arrived",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c3",
                  "text": "if it were the last one",
                  "relationToPrev": "additive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "were",
                  "actor": "it",
                  "action": "were",
                  "object": "last one",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "perfect",
                  "propositionHead": "have",
                  "actor": "I",
                  "action": "have",
                  "object": "named capacity limit earlier instead",
                  "modifiers": [
                    "privately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "The memo itself is now in good shape, but the route we took to get there was not",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "The memo itself is now in good shape, but the route we took to get there was not",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "get",
                  "actor": "The memo",
                  "action": "get",
                  "object": "there",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "For the next round I would like us to define a stop detail before weekend work starts presenting itself because thoughtfulness.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "For the next round I would like us to define a stop detail before weekend work starts presenting itself",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "would",
                  "actor": "the next",
                  "action": "would",
                  "object": "like us define stop detail",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "thoughtfulness",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "thoughtfulness",
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
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "connector-stance",
            "lexical-register",
            "directness"
          ],
          "lexemeSwaps": [
            {
              "family": "detail",
              "from": "point",
              "to": "detail",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness."
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
          "directness",
          "lexical-register"
        ],
        "lexemeSwapFamilies": [
          "check",
          "detail"
        ],
        "relationInventory": [
          "additive:1",
          "causal:6",
          "clarifying:0",
          "contrastive:2",
          "resumptive:0",
          "temporal:2"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "baseline-function-word",
          "baseline-voice-realization",
          "connector-stance-lexicon"
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
    "overwork-debrief-tangled-followup-under-professional-message": {
      "id": "overwork-debrief-tangled-followup-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
      "donorText": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 21.33,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.07,
          "contentWordComplexity": 0.373,
          "modifierDensity": 0.038,
          "directness": 0.08,
          "abstractionPosture": 0.333
        }
      },
      "retrievalTrace": {
        "sourceText": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 21.35,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.07,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.373,
            "modifierDensity": 0.056,
            "hedgeDensity": 0,
            "directness": 0.104,
            "abstractionPosture": 0.373,
            "latinatePreference": 0.057,
            "recurrencePressure": 0.121
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 9,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I am following up because my first apology still made the weekend sound accidental",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "following up first apology made",
                  "modifiers": [
                    "accidental"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "that is too gentle",
                  "relationToPrev": "clarifying",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "that",
                  "action": "is",
                  "object": "too gentle",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "send",
                  "actor": "The pattern",
                  "action": "send",
                  "object": "one more pass table looked",
                  "modifiers": [
                    "final",
                    "table",
                    "defensible",
                    "suddenly"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "I did not want to be the person who said no after everyone else had already stayed online",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "said",
                  "actor": "I",
                  "action": "said",
                  "object": "no after everyone else already",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "None of that was a formal demand, which is exactly how I kept talking myself into it",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "None of that was a formal demand, which is exactly how I kept talking myself into it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "that",
                  "action": "kept",
                  "object": "talking myself into",
                  "modifiers": [
                    "formal",
                    "exactly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "By Sunday night the memo was fine and my capacity was not",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "By Sunday night the memo was fine and my capacity was not",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "the memo",
                  "action": "was",
                  "object": "fine capacity",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "I am trying to name the thing correctly this time: the problem was not dedication",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "I am trying to name the thing correctly this time: the problem was not dedication",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "progressive",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "trying name thing correctly time",
                  "modifiers": [
                    "correctly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "It was the way I kept translating exhaustion into politeness",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "It",
                  "action": "kept",
                  "object": "translating exhaustion into politeness",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "the schedule looked consensual",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "schedule",
                  "actor": "the schedule",
                  "action": "schedule",
                  "object": "looked consensual",
                  "modifiers": [
                    "consensual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 4,
          "sentenceMerge": 5,
          "contraction": 6,
          "connector": 8,
          "lineBreak": 5,
          "additive": 3,
          "contrastive": 1,
          "causal": 4,
          "temporal": 2,
          "clarifying": 2,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "causal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 1,
            "causal": 4,
            "temporal": 2,
            "clarifying": 2,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -0.9799999999999969
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.0020000000000000018,
            "modifierDensityDelta": -0.058,
            "directnessDelta": -0.076,
            "abstractionDelta": -0.127,
            "latinateDelta": 0.019000000000000003,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 1,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 336.218,
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
              "lexical-register",
              "content-word-complexity",
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 336.218,
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
                "lexical-register",
                "content-word-complexity",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 219.018,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 218.752,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 219.018,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 264.014,
              "passesApplied": [
                "baseline-phrase",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "contraction-auxiliary",
                "cleanup-restore",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "I am following up as my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final forward. Another pass as the table looked sloppy, another pass as the citations were not defensible enough, another pass as the tone in chat suddenly altered. And I did not want to be the person who explained no after everyone else had already stayed online. None of that was a formal demand, that's exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time. The problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
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
            "content-word-complexity",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "shifted",
              "to": "altered",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "send",
              "to": "forward",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.909,
          "actorCoverage": 1,
          "actionCoverage": 0.907,
          "objectCoverage": 0.883,
          "polarityMismatches": 1,
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
              "globalBagScore": 0.13
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
              "globalBagScore": 0.043
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 1,
              "bagScore": 0.3,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 0.18000000000000002,
              "actorCoverage": 1,
              "actionCoverage": 0.16200000000000003,
              "objectCoverage": 0.2,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.1,
              "globalBagScore": 0.02
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.13
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.065
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.109
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.109
            },
            {
              "sourceClauseId": "s5c1",
              "matchedClauseId": "s8c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.065
            }
          ],
          "sourceClauseCount": 9,
          "outputClauseCount": 14
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 9,
            "clauseCount": 14,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "I am following up as my first apology still made the weekend sound accidental, and that is too gentle",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "I am following up as my first apology still made the weekend sound accidental",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "following up first apology made",
                  "modifiers": [
                    "accidental"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "that is too gentle",
                  "relationToPrev": "clarifying",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "that",
                  "action": "is",
                  "object": "too gentle",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The pattern was familiar long before the final forward",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The pattern was familiar long before the final forward",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "forward",
                  "actor": "The pattern",
                  "action": "forward",
                  "object": "",
                  "modifiers": [
                    "final"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Another pass as the table looked sloppy, another pass as the citations were not defensible enough, another pass as the tone in chat suddenly altered",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Another pass",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "another",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "the table looked sloppy, another pass",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "table",
                  "actor": "the table",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c2",
                  "text": "the citations were not defensible enough, another pass",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "were",
                  "actor": "the citations",
                  "action": "were",
                  "object": "defensible enough another pass",
                  "modifiers": [
                    "defensible"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c3",
                  "text": "the tone in chat suddenly altered",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "tone",
                  "actor": "the tone",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "suddenly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "And I did not want to be the person who explained no after everyone else had already stayed online",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "And I did not want to be the person who explained no after everyone else had already stayed online",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "did",
                  "actor": "I",
                  "action": "did",
                  "object": "want person who explained no",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "None of that was a formal demand, that's exactly how I kept talking myself into it",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "None of that was a formal demand, that's exactly how I kept talking myself into it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "that",
                  "action": "kept",
                  "object": "talking myself into",
                  "modifiers": [
                    "formal",
                    "exactly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "By Sunday night the memo was fine and my capacity was not",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "By Sunday night the memo was fine and my capacity was not",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "the memo",
                  "action": "was",
                  "object": "fine capacity",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "I am trying to name the thing correctly this time",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "I am trying to name the thing correctly this time",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "trying name thing correctly time",
                  "modifiers": [
                    "correctly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The problem was not dedication",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The problem was not dedication",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "The problem",
                  "action": "was",
                  "object": "dedication",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "It was the way I kept translating exhaustion into politeness until the schedule looked consensual.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "It was the way I kept translating exhaustion into politeness",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "It",
                  "action": "kept",
                  "object": "translating exhaustion into politeness",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s8c1",
                  "text": "the schedule looked consensual",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "schedule",
                  "actor": "the schedule",
                  "action": "schedule",
                  "object": "looked consensual",
                  "modifiers": [
                    "consensual"
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
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "say",
              "from": "said",
              "to": "explained",
              "kind": "lexeme"
            },
            {
              "family": "change",
              "from": "shifted",
              "to": "altered",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "send",
              "to": "forward",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, content-word-complexity, directness."
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
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "change",
          "say",
          "send"
        ],
        "relationInventory": [
          "additive:3",
          "causal:4",
          "clarifying:2",
          "contrastive:1",
          "resumptive:1",
          "temporal:2"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "causal",
        "contractionStrategy": "hold",
        "propositionCoverage": 0.909,
        "actorCoverage": 1,
        "actionCoverage": 0.907,
        "objectCoverage": 0.883,
        "polarityMismatches": 1,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "customer-support-formal-record-under-rushed-mobile": {
      "id": "customer-support-formal-record-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
      "donorText": "acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 7.17,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.14,
          "contentWordComplexity": 0.234,
          "modifierDensity": 0,
          "directness": 0.36,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 7.41,
            "sentenceCount": 8,
            "contractionDensity": 0,
            "punctuationDensity": 0.139,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.282,
            "modifierDensity": 0.061,
            "hedgeDensity": 0,
            "directness": 0.36,
            "abstractionPosture": 0.667,
            "latinatePreference": 0.005,
            "recurrencePressure": 0.137
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "@elmfield.net",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "11:23 AM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "CS-88412",
                "placeholder": "zzprotlitczz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Customer contacted support at zzprotlitbzz regarding account access loss after a password reset attempt triggered the fraud hold",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Customer contacted support at zzprotlitbzz regarding account access loss after a password reset attempt triggered the fraud hold",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "contacted",
                  "actor": "a password",
                  "action": "contacted",
                  "object": "support at zzprotlitbzz regarding account",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The user could still receive one-time codes but could not complete login",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "could",
                  "actor": "The user",
                  "action": "could",
                  "object": "receive one time codes complete",
                  "modifiers": [
                    "receive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the system flagged the device",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flagged",
                  "actor": "the system",
                  "action": "flagged",
                  "object": "device",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "new and placed the account in manual review",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "the account",
                  "action": "review",
                  "object": "",
                  "modifiers": [
                    "manual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Case number zzprotlitczz",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Case number zzprotlitczz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "case",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The customer confirmed the last four digits on file and the recovery email ending in zzprotlitazz, which matched account records",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The customer confirmed the last four digits on file and the recovery email ending in zzprotlitazz, which matched account records",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The customer",
                  "action": "confirmed",
                  "object": "last four digits file recovery",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "A prior support thread had already instructed the user to retry the reset flow",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "A prior",
                  "action": "had",
                  "object": "already instructed user retry reset",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "that advice did not clear the hold because the underlying issue was not credential mismatch",
                  "relationToPrev": "causal",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "issue",
                  "actor": "that",
                  "action": "issue",
                  "object": "credential mismatch",
                  "modifiers": [
                    "credential"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "It was the fraud lock itself",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "It was the fraud lock itself",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "fraud lock itself",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "The account remains inaccessible until review removes the device challenge or support performs verified override",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "The account remains inaccessible",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "account",
                  "actor": "The account",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "inaccessible"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "review removes the device challenge or support performs verified override",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "the device",
                  "action": "review",
                  "object": "removes device challenge support performs",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The procedural risk is repeated generic guidance that makes the customer loop through the same dead path",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The procedural",
                  "action": "is",
                  "object": "repeated generic guidance makes customer",
                  "modifiers": [
                    "procedural",
                    "generic"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "the fraud queue stays untouched",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fraud",
                  "actor": "the fraud",
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
          "sentenceSplit": 1,
          "sentenceMerge": 8,
          "contraction": 2,
          "connector": 9,
          "lineBreak": 7,
          "additive": 2,
          "contrastive": 3,
          "causal": 3,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 2,
            "contrastive": 3,
            "causal": 3,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -10.969999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.15400000000000003,
            "modifierDensityDelta": 0,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.015,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 24,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": -41.968,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "connector-stance"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Transfer stayed too close to punctuation-only drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": -41.968,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer stayed too close to punctuation-only drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": -34.094,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer stayed too close to punctuation-only drift."
              ]
            },
            {
              "spec": "split-heavy",
              "score": -34.094,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer stayed too close to punctuation-only drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": -35.594,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "connector-stance"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer stayed too close to punctuation-only drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new but placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which aligned account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
          "transferClass": "weak",
          "borrowedShellOutcome": "partial",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "connector-stance"
          ],
          "lexemeSwaps": [
            {
              "family": "match",
              "from": "matched",
              "to": "aligned",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "partial-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.985,
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
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.556,
              "globalBagScore": 0.125
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
              "globalBagScore": 0.128
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
              "globalBagScore": 0.064
            },
            {
              "sourceClauseId": "s1c2",
              "matchedClauseId": "s1c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.064
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
              "globalBagScore": 0.021
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.149
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s4c1",
              "matchedClauseId": "s4c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.064
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.064
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.043
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s6c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s7c1",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.021
            }
          ],
          "sourceClauseCount": 13,
          "outputClauseCount": 13
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "@elmfield.net",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "11:23 AM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "CS-88412",
                "placeholder": "zzprotlitczz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "contacted",
                  "actor": "a password",
                  "action": "contacted",
                  "object": "support at 11 23 regarding",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The user could still receive one-time codes but could not complete login because the system flagged the device as new but placed the account in manual review",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The user could still receive one-time codes but could not complete login",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "could",
                  "actor": "The user",
                  "action": "could",
                  "object": "receive one time codes complete",
                  "modifiers": [
                    "receive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the system flagged the device",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flagged",
                  "actor": "the system",
                  "action": "flagged",
                  "object": "device",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "new but placed the account in manual review",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "the account",
                  "action": "review",
                  "object": "",
                  "modifiers": [
                    "manual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Case number CS-88412",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Case number CS-88412",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "case",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which aligned account records",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which aligned account records",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "The customer",
                  "action": "confirmed",
                  "object": "last four digits file recovery",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "A prior support thread had already instructed the user to retry the reset flow",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "A prior",
                  "action": "had",
                  "object": "already instructed user retry reset",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "that advice did not clear the hold because the underlying issue was not credential mismatch",
                  "relationToPrev": "causal",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "issue",
                  "actor": "that",
                  "action": "issue",
                  "object": "credential mismatch",
                  "modifiers": [
                    "credential"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "It was the fraud lock itself",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "It was the fraud lock itself",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "fraud lock itself",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "The account remains inaccessible until review removes the device challenge or support performs verified override",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "The account remains inaccessible",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "account",
                  "actor": "The account",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "inaccessible"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "review removes the device challenge or support performs verified override",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "the device",
                  "action": "review",
                  "object": "removes device challenge support performs",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The procedural risk is repeated generic guidance that makes the customer loop through the same dead path",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The procedural",
                  "action": "is",
                  "object": "repeated generic guidance makes customer",
                  "modifiers": [
                    "procedural",
                    "generic"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "the fraud queue stays untouched",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fraud",
                  "actor": "the fraud",
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
          "borrowedShellOutcome": "partial",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "connector-stance"
          ],
          "lexemeSwaps": [
            {
              "family": "match",
              "from": "matched",
              "to": "aligned",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "partial-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        }
      },
      "semanticContract": {
        "transferClass": "weak",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "connector-stance"
        ],
        "lexemeSwapFamilies": [
          "match"
        ],
        "relationInventory": [
          "additive:2",
          "causal:3",
          "clarifying:0",
          "contrastive:3",
          "resumptive:1",
          "temporal:2"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.985,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "customer-support-rushed-mobile-under-formal-record": {
      "id": "customer-support-rushed-mobile-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script",
      "donorText": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 18.38,
          "sentenceCount": 8,
          "contractionDensity": 0,
          "punctuationDensity": 0.095,
          "contentWordComplexity": 0.436,
          "modifierDensity": 0.061,
          "directness": 0.36,
          "abstractionPosture": 0.667
        }
      },
      "retrievalTrace": {
        "sourceText": "acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 18.14,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.096,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.388,
            "modifierDensity": 0.046,
            "hedgeDensity": 0,
            "directness": 0.36,
            "abstractionPosture": 0.627,
            "latinatePreference": 0.015,
            "recurrencePressure": 0.175
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "CS-88412",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "4",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "acct still locked",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "acct still locked",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "acct",
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
              "raw": "can get the code but login dies at fraud review every time",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "can get the code but login dies at fraud review every time",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "get",
                  "actor": "the code",
                  "action": "get",
                  "object": "code login dies at fraud",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "case zzprotlitazz",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "case zzprotlitazz",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "case",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "support keeps saying reset again even tho reset isnt the problem",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "support keeps saying reset again even tho reset isnt the problem",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "keeps",
                  "actor": "the problem",
                  "action": "keeps",
                  "object": "saying reset again even tho",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "last zzprotlitbzz + recovery email match",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "last zzprotlitbzz + recovery email match",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "match",
                  "actor": "",
                  "action": "match",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "need someone to clear hold not send same script",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "need someone to clear hold not send same script",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "need",
                  "actor": "",
                  "action": "need",
                  "object": "someone clear hold send same",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 5,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 5,
          "additive": 0,
          "contrastive": 2,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "sentence-structure",
            "clause-join-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-rescue"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 2,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 10.97
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.154,
            "modifierDensityDelta": 0.046,
            "directnessDelta": 0,
            "abstractionDelta": 0.127,
            "latinateDelta": 0.015,
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
            "score": 201.068,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "planned-sentence-merge",
              "sentence-structure",
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
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "modifier-density",
              "directness",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Structural opportunity existed but the current candidate collapsed into additive drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 193.31,
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
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 201.068,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
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
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "merge-heavy",
              "score": 201.068,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
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
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 201.068,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
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
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": 201.068,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "planned-sentence-merge",
                "sentence-structure",
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
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Acct still locked, but can receive the code but login dies at fraud review every time - case CS-88412. And support keeps saying reset again even tho reset isnt the problem. Last 4, recovery email align. And need someone to clear hold not forward same script.",
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
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "get",
              "from": "get",
              "to": "receive",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "send",
              "to": "forward",
              "kind": "lexeme"
            },
            {
              "family": "match",
              "from": "match",
              "to": "align",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue",
            "partial-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.958,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s2c0",
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
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.167,
              "globalBagScore": 0.08
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
              "bagScore": 0,
              "globalBagScore": 0.048
            },
            {
              "sourceClauseId": "s3c0",
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
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.048
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s3c0",
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
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "CS-88412",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "4",
                "placeholder": "zzprotlitbzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Acct still locked, but can receive the code but login dies at fraud review every time - case CS-88412",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Acct still locked, but can receive the code but login dies at fraud review every time - case CS-88412",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "the code",
                  "action": "review",
                  "object": "every time case cs 88412",
                  "modifiers": [
                    "receive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "And support keeps saying reset again even tho reset isnt the problem",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "And support keeps saying reset again even tho reset isnt the problem",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "keeps",
                  "actor": "the problem",
                  "action": "keeps",
                  "object": "saying reset again even tho",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Last 4, recovery email align",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Last 4, recovery email align",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "align",
                  "actor": "",
                  "action": "align",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "And need someone to clear hold not forward same script.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "And need someone to clear hold not forward same script",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "need",
                  "actor": "",
                  "action": "need",
                  "object": "someone clear hold forward same",
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
            "modifier-density",
            "directness",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "get",
              "from": "get",
              "to": "receive",
              "kind": "lexeme"
            },
            {
              "family": "send",
              "from": "send",
              "to": "forward",
              "kind": "lexeme"
            },
            {
              "family": "match",
              "from": "match",
              "to": "align",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, modifier-density, directness.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "structural-rescue",
            "connector-stance-rescue",
            "partial-rescue"
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
          "directness",
          "lexical-register",
          "modifier-density",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "get",
          "match",
          "send"
        ],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:2",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "sentence-structure",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-rescue"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.958,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "school-coordination-professional-message-under-rushed-mobile": {
      "id": "school-coordination-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
      "donorText": "hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 9,
          "sentenceCount": 5,
          "contractionDensity": 0,
          "punctuationDensity": 0.133,
          "contentWordComplexity": 0.269,
          "modifierDensity": 0,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 9.28,
            "sentenceCount": 5,
            "contractionDensity": 0,
            "punctuationDensity": 0.133,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.284,
            "modifierDensity": 0.028,
            "hedgeDensity": 0,
            "directness": 0.199,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.04,
            "recurrencePressure": 0.129
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 5,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "3:17 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "1:48 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "2:03 PM",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "ID",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at zzprotlitazz after zzprotlitdzz verification",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at zzprotlitazz after zzprotlitdzz verification",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "change",
                  "actor": "the student",
                  "action": "change",
                  "object": "aunt maribel approved pickup signed",
                  "modifiers": [
                    "dismissal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "We also wanted to note that the museum field-trip permission slip still was not located by close of day",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "located",
                  "actor": "We",
                  "action": "located",
                  "object": "by close day",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the fee waiver form is already on file",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the fee",
                  "action": "is",
                  "object": "already file",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "During the zzprotlitbzz phone call, you mentioned the signed slip might still be in the backpack",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "During the zzprotlitbzz phone call, you mentioned the signed slip might still be in the backpack",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "call",
                  "actor": "the zzprotlitbzz",
                  "action": "call",
                  "object": "mentioned signed slip backpack",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We sent a reminder to the classroom at zzprotlitczz, but the paper did not surface before dismissal",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We sent a reminder to the classroom at zzprotlitczz, but the paper did not surface before dismissal",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "sent",
                  "actor": "We",
                  "action": "sent",
                  "object": "reminder classroom at zzprotlitczz paper",
                  "modifiers": [
                    "dismissal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "If the signed permission page comes home tonight, please return it tomorrow morning",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "comes",
                  "actor": "the signed",
                  "action": "comes",
                  "object": "home tonight please return tomorrow",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "Friday's trip record is complete",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "",
                  "action": "is",
                  "object": "complete",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 2,
          "sentenceMerge": 4,
          "contraction": 2,
          "connector": 6,
          "lineBreak": 4,
          "additive": 2,
          "contrastive": 4,
          "causal": 1,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 2
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "contraction-auxiliary",
            "punctuation-finish",
            "lexical-register-rescue"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "decrease",
          "relationInventory": {
            "additive": 2,
            "contrastive": 4,
            "causal": 1,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 2
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -12.520000000000001
          },
          "discourseGoals": {
            "contractionDelta": -0.018,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.04600000000000004,
            "modifierDensityDelta": 0,
            "directnessDelta": -0.061,
            "abstractionDelta": 0,
            "latinateDelta": -0.0020000000000000018,
            "registerMode": "plain"
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
            "score": 292.78,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "planned-sentence-split",
              "contraction-auxiliary",
              "punctuation-finish",
              "cleanup-restore",
              "structural-rescue",
              "lexical-register-rescue"
            ],
            "rescuePasses": [
              "structural-rescue",
              "lexical-register-rescue"
            ],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 108.922,
              "passesApplied": [
                "split-rules",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Transfer missed donor lexical/register realization."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 292.78,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 292.78,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 292.78,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 287.794,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "contraction-auxiliary",
                "cleanup-restore",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hello. Confirming today's dismissal change. Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip slip still wasn't found by close of day. Even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper didn't surface before dismissal, if the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
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
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "find",
              "from": "located",
              "to": "found",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [
            "structural-rescue",
            "lexical-register-rescue"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.949,
          "actionCoverage": 1,
          "objectCoverage": 0.929,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0+s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.118
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s4c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.088
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 0.643,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.556,
              "globalBagScore": 0.139
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.206
            },
            {
              "sourceClauseId": "s4c1",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.029
            }
          ],
          "sourceClauseCount": 7,
          "outputClauseCount": 10
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 10,
            "literalSpans": [
              {
                "value": "3:17 PM",
                "placeholder": "zzprotlitazz"
              },
              {
                "value": "1:48 PM",
                "placeholder": "zzprotlitbzz"
              },
              {
                "value": "2:03 PM",
                "placeholder": "zzprotlitczz"
              },
              {
                "value": "ID",
                "placeholder": "zzprotlitdzz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hello",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hello",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "hello",
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
              "raw": "Confirming today's dismissal change",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Confirming today's dismissal change",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "change",
                  "actor": "",
                  "action": "change",
                  "object": "",
                  "modifiers": [
                    "dismissal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the student",
                  "action": "was",
                  "object": "approved pickup signed student out",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We also wanted to note that the museum field-trip slip still wasn't found by close of day",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We also wanted to note that the museum field-trip slip still wasn't found by close of day",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "found",
                  "actor": "We",
                  "action": "found",
                  "object": "by close day",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Even though the fee waiver form is already on file",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Even",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "even",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "the fee waiver form is already on file",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the fee",
                  "action": "is",
                  "object": "already file",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "call",
                  "actor": "the 1",
                  "action": "call",
                  "object": "mentioned signed slip backpack",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "We sent a reminder to the classroom at 2:03 PM, but the paper didn't surface before dismissal",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "We sent a reminder to the classroom at 2:03 PM, but the paper didn't surface before dismissal",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "sent",
                  "actor": "We",
                  "action": "sent",
                  "object": "reminder classroom at 2 03",
                  "modifiers": [
                    "dismissal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "If the signed permission page comes home tonight, please return it tomorrow morning",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "comes",
                  "actor": "the signed",
                  "action": "comes",
                  "object": "home tonight please return tomorrow",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "Friday's trip record is complete",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "",
                  "action": "is",
                  "object": "complete",
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
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "find",
              "from": "located",
              "to": "found",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "structural-rescue",
            "lexical-register-rescue"
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
          "contraction-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "find"
        ],
        "relationInventory": [
          "additive:2",
          "causal:1",
          "clarifying:0",
          "contrastive:4",
          "resumptive:2",
          "temporal:2"
        ],
        "structuralOperations": [
          "baseline-split",
          "planned-sentence-split",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "contraction-auxiliary",
          "lexical-register-rescue",
          "punctuation-finish"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "decrease",
        "propositionCoverage": 1,
        "actorCoverage": 0.949,
        "actionCoverage": 1,
        "objectCoverage": 0.929,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "school-coordination-rushed-mobile-under-professional-message": {
      "id": "school-coordination-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change",
      "donorText": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 21.8,
          "sentenceCount": 5,
          "contractionDensity": 0.018,
          "punctuationDensity": 0.138,
          "contentWordComplexity": 0.33,
          "modifierDensity": 0.028,
          "directness": 0.26,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 21.52,
            "sentenceCount": 5,
            "contractionDensity": 0.018,
            "punctuationDensity": 0.138,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.315,
            "modifierDensity": 0.021,
            "hedgeDensity": 0,
            "directness": 0.241,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.042,
            "recurrencePressure": 0.146
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 5,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "3",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "hi office - aunt maribel has to do pickup today not grandma",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "hi office - aunt maribel has to do pickup today not grandma",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "has",
                  "actor": "",
                  "action": "has",
                  "object": "pickup today grandma",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "shell have id",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "shell have id",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "have",
                  "actor": "",
                  "action": "have",
                  "object": "id",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "also i swear i signed the museum slip, it might still be in backpack w the waiver papers",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "also i swear i signed the museum slip, it might still be in backpack w the waiver papers",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "might",
                  "actor": "i",
                  "action": "might",
                  "object": "backpack w waiver papers",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "if class can check before zzprotlitazz that would help",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "if class can check before zzprotlitazz that would help",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "check",
                  "actor": "that",
                  "action": "check",
                  "object": "before zzprotlitazz help",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "sorry for late change",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "sorry for late change",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "change",
                  "actor": "",
                  "action": "change",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 4,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 4,
          "additive": 1,
          "contrastive": 1,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-function-word",
            "punctuation-finish"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 1,
            "contrastive": 1,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 12.52
          },
          "discourseGoals": {
            "contractionDelta": 0.018,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.045999999999999985,
            "modifierDensityDelta": 0.021,
            "directnessDelta": 0.061,
            "abstractionDelta": 0,
            "latinateDelta": 0.0020000000000000018,
            "registerMode": "operational"
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
            "score": 262.568,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "baseline-function-word",
              "planned-sentence-merge",
              "sentence-structure",
              "clause-join-split",
              "punctuation-finish"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 256.7,
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
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 262.568,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 262.568,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 262.568,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 260.906,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hi office - aunt maribel has to do pickup today not grandma; and she'll have ID; and I swear I signed the museum slip, it might still be in backpack w the waiver papers, but if class can check before 3 that would help. Sorry for late shift",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "change",
              "from": "change",
              "to": "shift",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "rescuePasses": [],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.9,
          "polarityMismatches": 1,
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
              "globalBagScore": 0.333
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
              "globalBagScore": 0.111
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c0+s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.6,
              "globalBagScore": 0.3
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.111
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "3",
                "placeholder": "zzprotlitazz"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hi office - aunt maribel has to do pickup today not grandma; yet and shell have id; though also I swear I signed the museum slip, it might still be in backpack w the waiver papers, but if class can check before 3 that would help",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hi office - aunt maribel has to do pickup today not grandma",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "has",
                  "actor": "",
                  "action": "has",
                  "object": "pickup today grandma",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "yet and shell have id",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "have",
                  "actor": "",
                  "action": "have",
                  "object": "id",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "though also I swear I signed the museum slip, it might still be in backpack w the waiver papers, but if class can check before 3 that would help",
                  "relationToPrev": "contrastive",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "check",
                  "actor": "I",
                  "action": "check",
                  "object": "before 3 help",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Sorry for late shift",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Sorry for late shift",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "shift",
                  "actor": "",
                  "action": "shift",
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
            "connector-stance",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "change",
              "from": "change",
              "to": "shift",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Semantic risk is elevated; review the realized output before relying on it."
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
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "change"
        ],
        "relationInventory": [
          "additive:1",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "sentence-structure"
        ],
        "lexicalOperations": [
          "baseline-function-word",
          "baseline-voice-realization",
          "punctuation-finish"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.9,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    }
  }
};
})();
