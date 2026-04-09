# Tilbud — Påmeldingsplattform for Sålevending

**Fra:** Ole Thomas Skogli
**Til:** Sålevending v/ Erik Rosland
**Dato:** April 2026

---

## 1. Bakgrunn

Sålevending arrangerer fotballturneringer for ungdom i Oslo, med opptil 300–400 deltakere og 64 lag per turnering. I dag skjer påmelding og kommunikasjon via Google Docs/Skjema, noe som fører til:

- Uoversiktlig for både deltakere og arrangører
- Dobbeltregistreringer som er vanskelige å oppdage
- Manuell kommunikasjon med lagkapteiner
- Ingen samlet oversikt over påmeldte lag og spillere

Fra workshopen vet vi at primærbrukerne er ungdom (13–18 år) som er vant til raske, enkle løsninger (Snapchat-tempo), har lav tålmodighet for kompliserte systemer, og forventer en mobilopplevelse.

**Målet** er en profesjonell plattform klar for lansering før fellesferien 2026.

---

## 2. Løsning — Hva som er levert

### For ungdom (deltakere)
- **Enkel registrering i 5 steg**: Opprett konto, fyll ut profil, opprett lag og meld på turnering — alt i én sammenhengende flyt
- **Laghåndtering**: Opprett lag, inviter spillere via delbar lenke (enkelt å sende på Snapchat), se lagoversikt
- **Turneringsoversikt**: Se aktive turneringer med dato, sted, påmeldingsfrist og praktisk info
- **Meldinger**: Motta beskjeder fra arrangør direkte i appen
- **Profil**: Rediger personlig info, se lagstatus, logg ut

### For arrangører (admin)
- **Dashboard**: Oversikt over antall brukere, lag og aktive turneringer
- **Brukerhåndtering**: Søk, filtrer og verifiser brukere
- **Turneringshåndtering**: Opprett turneringer, åpne/steng påmelding, sett maks antall lag
- **Kvalifisering**: Velg lag fra liste, marker som kvalifisert/venteliste/avvist med ett klikk
- **Meldinger**: Send beskjeder til enkeltkapteiner eller alle kapteiner i en turnering

### Personvern og sikkerhet
- **GDPR-kompatibel**: Samtykkehåndtering ved registrering, personvernerklæring på norsk
- **Foreldresamtykke**: Bekreftelse for brukere under 16 år
- **Dataeksport**: Brukere kan eksportere sine data i maskinlesbart format
- **Kontosletting**: Brukere kan slette konto og all tilknyttet data
- **Sikkerhet**: Krypterte passord, tilgangskontroll på alle data, duplikatbeskyttelse

### Design
- **Mobiltilpasset**: Designet for telefoner først — store knapper, kort-basert layout, bunnmeny
- **Sålevending-profil**: Mørkt tema med logo og farger fra saalevending.no
- **Spond-inspirert**: Få klikk, lite tekst, tydelige valg — slik ungdom forventer

### Demo
- **Ferdig demomodus**: Appen kan kjøres og testes uten noe oppsett. Tre ferdige demobrukere (kaptein, spiller, admin) med realistisk testdata.

---

## 3. Teknisk plattform

| | |
|---|---|
| **Frontend** | SvelteKit — moderne, raskt, liten filstørrelse |
| **Backend** | Supabase — database, autentisering, sikkerhet |
| **Datalagring** | EU/EØS (GDPR-kompatibelt) |
| **Kapasitet** | 400+ brukere, 64+ lag per turnering |
| **Status** | Klar for produksjonssetting |

---

## 4. Pris

### Leveranseoversikt

| Leveranse | Beskrivelse |
|-----------|------------|
| Registreringsløsning | 5-stegs påmelding med konto, profil og lag |
| Laghåndtering | Invitasjonslenker, spilleroversikt, kapteinfunksjon |
| Turneringsoversikt | Påmelding, frister, kapasitet, praktisk info |
| Adminpanel | Brukeroversikt, kvalifisering, meldinger til kapteiner |
| Personvern/GDPR | Samtykke, foreldregodkjenning, dataeksport, kontosletting |
| Design | Mobiltilpasset, mørkt tema, Sålevending-profil |
| Demo | Ferdig demomodus for gjennomgang og presentasjon |

**Fastpris: 150 000 NOK**

### Teknisk spesifikasjon

| Komponent | Teknologi | Timer | Pris |
|-----------|-----------|-------|------|
| Frontend (50+ filer, 8 sider) | SvelteKit, Svelte 5, TypeScript | 25 | 25 000 |
| UI-komponenter og design | shadcn-svelte, Tailwind CSS v4, Outfit font | 12 | 12 000 |
| Skjemavalidering (11 felt) | Superforms + Zod 4 med norske feilmeldinger | 8 | 8 000 |
| Database (5 tabeller, RLS) | Supabase PostgreSQL, triggers, indekser | 8 | 8 000 |
| Autentisering og sikkerhet | Supabase Auth, email OTP, 2FA, rutebeskyttelse | 10 | 10 000 |
| Adminpanel (5 sider) | Dashboard, brukere, turneringer, kvalifisering, meldinger | 20 | 20 000 |
| 5-stegs onboarding | Konto + profil + lag i sammenhengende flyt | 10 | 10 000 |
| Demomodus | In-memory state, 7 brukere, 4 lag, 3 turneringer | 10 | 10 000 |
| GDPR og personvern | Samtykke, personvernerklæring, eksport, sletting | 7 | 7 000 |
| Typesikkerhet og kvalitet | Zod-infererte typer, 0 feil i typesjekk, testing | 10 | 10 000 |
| Planlegging og arkitektur | Databasedesign, komponentstruktur, dataflyt | 8 | 8 000 |
| **Totalt** | | **128 timer** | **128 000 NOK** |

*Timepris: 1 000 NOK/time. Fastpris inkluderer prosjektledelse og buffer.*

### Ikke inkludert i prisen

| Post | Estimert kostnad |
|------|-----------------|
| Hosting og drift (Vercel + Supabase) | 200–500 NOK/mnd |
| Domene (subdomain eller nytt) | 100–300 NOK/år |
| E-posttjeneste for verifisering (Resend) | Gratis opp til 3 000 e-poster/mnd |
| Fremtidige funksjoner (kampoppsett, live, QR, ranking) | Etter avtale |

### Valgfritt: Løpende support

| Pakke | Innhold | Pris |
|-------|---------|------|
| Basis | Feilretting, små justeringer, oppdateringer | 5 000 NOK/mnd |
| Utvidet | Basis + nye funksjoner, prioritert support | 10 000 NOK/mnd |

---

## 5. Neste steg

| Steg | Beskrivelse | Tidslinje |
|------|------------|-----------|
| 1 | Gjennomgang av demo sammen | Denne uken |
| 2 | Tilbakemelding og eventuelle justeringer | 1 uke |
| 3 | Oppsett av Supabase produksjonsmiljø | 1 dag |
| 4 | Konfigurering av e-postsending (verifisering) | 1 dag |
| 5 | Domene og deployment (Vercel/Netlify) | 1 dag |
| 6 | Testing med reelle brukere | 1–2 uker |
| 7 | Lansering | Klar før fellesferien |

---

## 6. Vedlegg

- **Demo-instruksjoner**: Se [DEMO.md](DEMO.md) for hvordan du kjører og tester appen
- **Teknisk dokumentasjon**: Se [README.md](README.md) for full teknisk oversikt
- **Personvernerklæring**: Tilgjengelig i appen under `/personvern`

---

*Ved spørsmål, ta kontakt på [din e-post] eller [ditt telefonnummer].*
