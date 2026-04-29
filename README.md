# 🏭 StockFlow-3차
**매장–본사 통합 재고관리 플랫폼 (MES + Kubernetes + AI)**  

📅 프로젝트 기간: 2026.04.13 ~ 진행 중  

> 💡 “엑셀 대신 AI가, 수작업 대신 자동화가 — 패션 브랜드를 위한 스마트 MES 시스템”

---
1. **[프로젝트 소개](#프로젝트-소개)**
2. **[기술 스택](#기술-스택)**
3. **[주요 기능](#주요-기능)**
4. **[시스템 아키텍쳐](#시스템-아키텍쳐)**
5. **[동작](#동작)**
6. **[서비스 화면](#서비스-화면)**


<br />

## 프로젝트 소개

패션 브랜드 매장 실무자들과의 인터뷰를 통해
수작업으로 **재고를 집계하고 엑셀로 보고서**를 작성하는 **반복적인** 비효율을 확인하게 되었습니다.

실시간으로 파악되지 않는 재고 현황, 수작업 발주로 인한 과발주·품절 반복, 본사와 매장 간 재고 불일치…

이러한 실제 패션 브랜드 운영자들의 고충을 해결하기 위해,
**MES(Manufacturing Execution System)** 구조를 기반으로 **본사·매장·창고**를 통합하여 **재고 흐름을 실시간**으로 관리하는
**StockFlow** 프로젝트를 기획·개발하게 되었습니다.

> 🚀 **Spring Boot + React + Kafka + Redis + Kubernetes + AI** 기반으로  
> 배분·발주 자동화부터 수요 예측·이상탐지까지
> 패션 브랜드의 재고관리를 스마트하게 혁신하는 통합 플랫폼입니다.

</br>

---

## 기술 스택
### ✔️Frond-end
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=yellow"> <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"> <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white"> <img src="https://img.shields.io/badge/Recharts-FF7300?style=for-the-badge&logo=recharts&logoColor=white">


### ✔️Back-end
<img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=Java&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=Spring%20Boot&logoColor=yellow"> <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=Spring%20Security&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20Web%20Tokens&logoColor=white"> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white"> <img src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white"> <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black"> <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white"> <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=Apache%20Kafka&logoColor=white"> <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=Socket.io&logoColor=white">

### ✔️Infra
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=Docker&logoColor=white">


### ✔️ Tools
<img src="https://img.shields.io/badge/IntelliJ%20IDEA-000000?style=for-the-badge&logo=IntelliJ%20IDEA&logoColor=white"> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white">


<br/>

## 주요 기능 

