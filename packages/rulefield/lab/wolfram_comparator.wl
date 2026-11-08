(* TD613 multiway Wolfram parity reference; NOT EXECUTED. *)
rf = ResourceFunction["MultiwaySystem"];
rulesDiamond = {"A" -> "B"};
rulesNonJoin = {"AB" -> "BA", "AB" -> "AA"};
rulesCompletion = {"AB" -> "BA", "AB" -> "AA", "BA" -> "AA"};
runCase[rules_, initial_, steps_] := Module[{res},
  res = Quiet@Check[
    <|
      "initial" -> initial,
      "rules" -> ToString[InputForm[rules]],
      "steps" -> steps,
      "states_unmerged" -> ToString[InputForm[rf[rules, initial, steps, "AllStatesListUnmerged"]]],
      "events" -> ToString[InputForm[rf[rules, initial, steps, "AllEventsList"]]],
      "branch_pairs" -> ToString[InputForm[rf[rules, initial, steps, "BranchPairsList"]]],
      "branch_pair_resolutions" -> ToString[InputForm[rf[rules, initial, steps, "BranchPairResolutionsList"]]],
      "states_graph_with_event_instances" -> ToString[InputForm[rf[rules, initial, steps, "StatesGraph", "IncludeEventInstances" -> True, "IncludeStatePathWeights" -> True]]]
    |>, $Failed
  ];
  If[res === $Failed, <|"error" -> "WOLFRAM_COMPUTATION_FAILED"|>, res]
];
witness = <|
 "schema" -> "td613.wolfram-external-comparison/v1",
 "status" -> "REQUIRES_EXTERNAL_EXECUTION_WITNESS",
 "wolfram_language_version" -> ToString[$Version],
 "diamond" -> runCase[rulesDiamond, "AA", 2],
 "terminal_branch_pair" -> runCase[rulesNonJoin, "AB", 3],
 "proposed_completion" -> runCase[rulesCompletion, "AB", 3],
 "scientific_credit" -> 0
|>;
Print[ExportString[witness, "RawJSON"]];
