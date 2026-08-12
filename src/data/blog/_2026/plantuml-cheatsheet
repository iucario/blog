---
title: PlantUML Cheatsheet
description: Only when Mermaid is not allowed
pubDatetime: 2026-08-12
modDatetime: 2026-08-12
draft: true
tags:
  - plantuml
---

Not a fan of PlantUML but team uses it :shrug:

`plantuml -tsvg -config style.puml system.puml`

plantuml style that looks like Mermaid:

```
@startuml 
skinparam shadowing false
skinparam roundcorner 5
skinparam defaultFontSize 14
<style>
document {
  BackgroundColor #FFFFFF
  FontColor #222222
  FontName "Recursive", "Inter", "Segoe UI", sans-serif
}
note {
    BackgroundColor #FEF3C7
    LineColor #D97706
    FontColor #78350F
    LineThickness 1.0
    FontName "Recursive", "Inter", "Segoe UI", sans-serif
}

activityDiagram {
  FontName "Recursive", "Inter", "Segoe UI", sans-serif
  HorizontalAlignment center
  activity {
    BackgroundColor #ECECFF
    LineColor #9370DB
    FontColor #222222
    LineThickness 1.2
  }
  ' OK / Success State (<<ok>>)
  .ok {
    BackgroundColor #E6F6EC
    LineColor #68C285
  }
  
  ' Error / Failure State (<<error>>)
  .error {
    BackgroundColor #FCEAEB
    LineColor #E57373
  }
  
  ' Notable / Info State (<<notable>>)
  .notable {
    BackgroundColor #E8F4FD
    LineColor #64B5F6
  }

  diamond {
    BackgroundColor #ECECFF
    LineColor #9370DB
    FontColor #222222
  }

  arrow {
    LineColor #333333      
    BackGroundColor #FFFFFF 
    LineThickness 1.2
    FontColor #222222
  }
}

</style>
```
