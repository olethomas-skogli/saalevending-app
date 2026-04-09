<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Personvern — Sålevending</title>
</svelte:head>

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-lg space-y-6">
		<div class="flex items-center justify-between">
			<img src="/logo.svg" alt="Sålevending" class="h-8 dark:invert" />
			<a href="/login" class="text-xs text-muted-foreground hover:text-foreground">Tilbake</a>
		</div>

		<div class="space-y-4">
			<h1 class="text-xl font-bold">Personvernerklæring</h1>
			<p class="text-sm text-muted-foreground">Sist oppdatert: mars 2026</p>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Behandlingsansvarlig</h2>
				<p class="text-sm text-muted-foreground">
					Sålevending er behandlingsansvarlig for personopplysningene som samles inn via denne plattformen.
					Kontakt: <a href="mailto:erik@saalevending.no" class="text-primary hover:underline">erik@saalevending.no</a>
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Hvilke opplysninger vi samler inn</h2>
				<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li><strong>Kontoinformasjon:</strong> e-postadresse og passord (kryptert)</li>
					<li><strong>Personopplysninger:</strong> fullt navn, telefonnummer, fødselsdato, bydel</li>
					<li><strong>Valgfritt:</strong> Snapchat-brukernavn</li>
					<li><strong>Laginformasjon:</strong> lagnavn, lagtype, aldersgruppe, skole(r)</li>
					<li><strong>Helseopplysninger:</strong> allergier (for å sikre trygg mat under turneringer)</li>
				</ul>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Formål med behandlingen</h2>
				<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>Administrere påmelding til fotballturneringer</li>
					<li>Kommunisere med lagkapteiner om turneringsdetaljer</li>
					<li>Tilrettelegge for trygg mat basert på allergier</li>
					<li>Forhindre duplikatregistreringer</li>
				</ul>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Rettslig grunnlag</h2>
				<p class="text-sm text-muted-foreground">
					Behandlingen av personopplysninger er basert på <strong>samtykke</strong> (GDPR artikkel 6(1)(a)).
					Behandling av allergiopplysninger (helseopplysninger) er basert på <strong>uttrykkelig samtykke</strong> (GDPR artikkel 9(2)(a)).
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Barn og samtykke</h2>
				<p class="text-sm text-muted-foreground">
					For brukere under 16 år krever vi bekreftelse på at foresatte har godkjent registreringen,
					i henhold til personopplysningsloven § 5 og GDPR artikkel 8.
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Lagring og oppbevaring</h2>
				<p class="text-sm text-muted-foreground">
					Personopplysninger lagres så lenge brukerkontoen er aktiv.
					Data slettes automatisk innen 12 måneder etter siste aktive turneringssesong,
					med mindre brukeren ber om sletting tidligere.
					All data lagres i EU/EØS via Supabase.
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Dine rettigheter</h2>
				<p class="text-sm text-muted-foreground">Du har rett til å:</p>
				<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li><strong>Se</strong> dine personopplysninger</li>
					<li><strong>Rette</strong> opplysningene dine</li>
					<li><strong>Slette</strong> kontoen din og alle tilknyttede data</li>
					<li><strong>Eksportere</strong> dine data i et maskinlesbart format</li>
					<li><strong>Trekke tilbake</strong> samtykket ditt når som helst</li>
				</ul>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Deling av data</h2>
				<p class="text-sm text-muted-foreground">
					Vi deler ikke personopplysninger med tredjeparter utover det som er nødvendig for å drifte plattformen.
					Turneringsarrangører har tilgang til påmeldingsinformasjon for lagene som deltar.
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Klage</h2>
				<p class="text-sm text-muted-foreground">
					Dersom du mener at behandlingen av personopplysninger ikke er i samsvar med regelverket,
					kan du klage til <strong>Datatilsynet</strong> (datatilsynet.no).
				</p>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold">Kontakt</h2>
				<p class="text-sm text-muted-foreground">
					Spørsmål om personvern? Kontakt oss på
					<a href="mailto:erik@saalevending.no" class="text-primary hover:underline">erik@saalevending.no</a>
					eller tlf. +47 926 15 771.
				</p>
			</section>
		</div>
	</div>
</div>
