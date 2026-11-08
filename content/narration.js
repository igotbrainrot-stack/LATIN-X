/* Owner-approved Miriam narration (Runway, eleven_v3, speed 0.9). Final owner decisions, 2026-11-09 handover.
 * Owner acceptance = listening/educational preference ("owner_not_latinist"), NOT Latinist verification.
 * Files live in audio/narration/miriam/. A clip whose file is absent falls back (sentences: browser voice,
 * clearly labelled "not Miriam"; words: a plain message). Speech aliases (tts_input) are provenance only:
 * the reader always shows canonical Latin. Rejected takes are listed nowhere here and never play. */
(function(root){
"use strict";
const T=(o)=>Object.freeze(o);
const v1=(n,task,dur)=>T({clip_id:"voiceA__legacy-ch01-s00"+n+"__v1",file:"s00"+n+"-v1.mp3",role:"default",
 source_file:"audio-audition/voiceA__legacy-ch01-s00"+n+"__v1.mp3",runway_task_id:task,tts_input:null,provider_duration_seconds:dur,
 owner_decision:"accept",decision_record:"docs/audio/owner-original-review-2026-11-07.json"});
root.TablinumNarrationCatalogue=T({
 schema:"latin-x-approved-narration-v2",
 decisions_date:"2026-11-09",
 voice:"Miriam",model:"eleven_v3",speed:0.9,
 review_status:"owner_accepted_listening_quality_not_latinist_verified",
 base_path:"audio/narration/miriam/",
 sentences:T([
  T({sentence_id:"legacy-ch01-s001",canonical_text:"Hic est hortus.",takes:T([v1(1,"9f7a5b5e-250b-472b-8116-2331698a5e41",1.724082)])}),
  T({sentence_id:"legacy-ch01-s002",canonical_text:"In hortō est arbor.",takes:T([v1(2,"e7216f81-ff9f-497f-a73e-98c37ef498ca",2.586122)])}),
  T({sentence_id:"legacy-ch01-s003",canonical_text:"In hortō est puella.",takes:T([v1(3,"501f603e-000e-42bd-8ab8-6117bd64fa94",1.959184)])}),
  T({sentence_id:"legacy-ch01-s004",canonical_text:"Puella Līvia est.",takes:T([v1(4,"91182986-1d63-44f9-833a-a3d426a738d6",1.959184)])}),
  T({sentence_id:"legacy-ch01-s005",canonical_text:"Arbor magna est.",takes:T([v1(5,"e17106d1-9ef0-40ee-b8ef-771fe798a3bd",2.037551)])}),
  T({sentence_id:"legacy-ch01-s006",canonical_text:"Līvia parva est.",takes:T([v1(6,"9f304361-74f0-4818-b7f4-d0f86e1b3b74",2.037551)])}),
  T({sentence_id:"legacy-ch01-s007",canonical_text:"Līvia arborem videt.",takes:T([
   T({clip_id:"s007-v6b",file:"s007-v6b.mp3",role:"default",runway_task_id:"7dbe3810-0cb9-435d-a1d6-bdf978821d95",tts_input:"Lii-wia arborem videt.",provider_duration_seconds:2.72,owner_decision:"accept",decision_record:"LATIN_X_CLAUDE_HANDOVER_20261109.md"}),
   T({clip_id:"s007-v6a",file:"s007-v6a.mp3",role:"alternative",runway_task_id:"2331d77d-7aa5-400b-9084-a6593a6666c3",tts_input:"Lee-wee-ah arborem videt.",provider_duration_seconds:2.48,owner_decision:"accept",decision_record:"LATIN_X_CLAUDE_HANDOVER_20261109.md"})])}),
  T({sentence_id:"legacy-ch01-s008",canonical_text:"Līvia sub arbore sedet.",takes:T([v1(8,"d650a09c-e9cb-46fc-a343-bf4fe89be51f",2.507755)])}),
  T({sentence_id:"legacy-ch01-s009",canonical_text:"Līvia laeta est.",takes:T([
   T({clip_id:"s009-v5a",file:"s009-v5a.mp3",role:"default",runway_task_id:"68a14597-2f02-42a9-9c65-12419d7dda73",tts_input:"Lee-wee-ah laeta est.",provider_duration_seconds:2.32,owner_decision:"accept",decision_record:"LATIN_X_CLAUDE_HANDOVER_20261109.md"})])})
 ]),
 /* Single-word recordings: played from the word-lookup panel, never as lesson narration. */
 words:T([
  T({canonical_text:"quoque",clip_id:"quoque-v4-approved",file:"word-quoque-v4.mp3",also_named:T(["quoque-v4-approved.mp3"]),runway_task_id:"8060b628-3555-4da4-b5de-499d80fdbc85",tts_input:"Kwoh-kweh.",provider_duration_seconds:1.12,owner_decision:"accept",decision_record:"LATIN_X_CLAUDE_HANDOVER_20261109.md"}),
  T({canonical_text:"vīlla",clip_id:"voiceA__test-villa__v2",file:"word-villa-v2.mp3",also_named:T(["voiceA__test-villa__v2.mp3"]),runway_task_id:"d0e9f755-d72c-4195-ae74-4aa84c8699c7",tts_input:"/ˈwiːl.la/",provider_duration_seconds:1.2,owner_decision:"accept",decision_record:"docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json"}),
  T({canonical_text:"aqua",clip_id:"voiceA__test-aqua__v3",file:"word-aqua-v3.mp3",also_named:T(["voiceA__test-aqua__v3.mp3"]),runway_task_id:"56c069b3-6746-4400-be64-29fe0597ba3c",tts_input:"AH-kwah",provider_duration_seconds:1.2,owner_decision:"accept",decision_record:"docs/audio/owner-miriam-alias-v3-review-2026-11-07.json"}),
  ...[["cēna","cena","9f971213-914e-4693-a3ba-1c1814faffe9",1.48898],["Gāius","gaius","2d4ba3ff-8e1a-4bc2-a0af-74fdec0867dd",0.992653],
      ["magna","magna","c1225af0-c734-4b18-9fb0-92c5afd5684f",1.959184],["pecūnia","pecunia","2cd95b10-14d0-4f79-b49a-5e88441c734d",2.037551],
      ["laeta","laeta","c456a05d-2cc3-46ae-afe2-c754bb6b38e9",1.880816]].map(([text,slug,task,dur])=>T({canonical_text:text,
   clip_id:"voiceA__test-"+slug+"__v1",file:"word-"+slug+"-v1.mp3",source_file:"audio-audition/voiceA__test-"+slug+"__v1.mp3",
   runway_task_id:task,tts_input:null,provider_duration_seconds:dur,owner_decision:"accept",decision_record:"docs/audio/owner-original-review-2026-11-07.json"}))
 ])
});
})(typeof globalThis!=="undefined"?globalThis:this);
