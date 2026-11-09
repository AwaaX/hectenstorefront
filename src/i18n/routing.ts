import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const locales = [
  "es-es", // Spanish (Spain)
  "de-de", // German (Germany)
  "it-it", // Italian (Italy)
  "nl-nl", // Dutch (Netherlands)
  "sv-se", // Swedish (Sweden)
  "en-us", // English (United States)
  "en-ca", // English (Canada)
  "en-au", // English (Australia)
  "en-ie", // English (Ireland)
  "en-gb", // English (United Kingdom)
  "fr-fr", // French (France)
] as const

export const defaultLocale = "en-gb"

export const pathnames = {
  // Home & Core Pages
  "/": "/",

  // Checkout & Order Management
  "/checkout": "/checkout",
  "/checkout/payment-return": "/checkout/payment-return",
  "/order/[id]/confirmed": "/order/[id]/confirmed",
  "/order/[id]/transfer/[token]": "/order/[id]/transfer/[token]",
  "/order/[id]/transfer/[token]/accept": "/order/[id]/transfer/[token]/accept",
  "/order/[id]/transfer/[token]/decline":
    "/order/[id]/transfer/[token]/decline",
  "/track-my-order": {
    "es-es": "/rastrear-mi-pedido",
    "de-de": "/meine-bestellung-verfolgen",
    "it-it": "/traccia-il-mio-ordine",
    "nl-nl": "/mijn-bestelling-volgen",
    "sv-se": "/spara-min-bestallning",
    "en-us": "/track-my-order",
    "en-ca": "/track-my-order",
    "en-au": "/track-my-order",
    "en-ie": "/track-my-order",
    "en-gb": "/track-my-order",
    "fr-fr": "/suivre-ma-commande",
  },

  // Shopping
  "/cart": {
    "es-es": "/carrito",
    "de-de": "/wagen",
    "it-it": "/carrello",
    "nl-nl": "/winkelwagen",
    "sv-se": "/varukorg",
    "en-us": "/cart",
    "en-ca": "/cart",
    "en-au": "/cart",
    "en-ie": "/cart",
    "en-gb": "/cart",
    "fr-fr": "/panier",
  },
  "/search": {
    "es-es": "/buscar",
    "de-de": "/suche",
    "it-it": "/ricerca",
    "nl-nl": "/zoeken",
    "sv-se": "/sok",
    "en-us": "/search",
    "en-ca": "/search",
    "en-au": "/search",
    "en-ie": "/search",
    "en-gb": "/search",
    "fr-fr": "/recherche",
  },
  "/results/[query]": {
    "es-es": "/resultados/[query]",
    "de-de": "/ergebnisse/[query]",
    "it-it": "/risultati/[query]",
    "nl-nl": "/resultaten/[query]",
    "sv-se": "/resultat/[query]",
    "en-us": "/results/[query]",
    "en-ca": "/results/[query]",
    "en-au": "/results/[query]",
    "en-ie": "/results/[query]",
    "en-gb": "/results/[query]",
    "fr-fr": "/resultats/[query]",
  },
  "/products/[handle]": {
    "es-es": "/productos/[handle]",
    "de-de": "/produkte/[handle]",
    "it-it": "/prodotti/[handle]",
    "nl-nl": "/producten/[handle]",
    "sv-se": "/produkter/[handle]",
    "en-us": "/products/[handle]",
    "en-ca": "/products/[handle]",
    "en-au": "/products/[handle]",
    "en-ie": "/products/[handle]",
    "en-gb": "/products/[handle]",
    "fr-fr": "/produits/[handle]",
  },

  // Product Collections - uses catch-all [...category] route
  "/shop": {
    "es-es": "/tienda",
    "de-de": "/shop",
    "it-it": "/negozio",
    "nl-nl": "/winkel",
    "sv-se": "/butik",
    "fr-fr": "/boutique",
    "en-us": "/shop",
    "en-ca": "/shop",
    "en-au": "/shop",
    "en-ie": "/shop",
    "en-gb": "/shop",
  },
  // Category pages with dynamic hierarchy


  // Account & User Pages
  "/account": {
    "es-es": "/cuenta",
    "de-de": "/konto",
    "it-it": "/account",
    "nl-nl": "/account",
    "sv-se": "/konto",
    "en-us": "/account",
    "en-ca": "/account",
    "en-au": "/account",
    "en-ie": "/account",
    "en-gb": "/account",
    "fr-fr": "/compte",
  },
  "/account/profile": {
    "es-es": "/cuenta/perfil",
    "de-de": "/konto/profil",
    "it-it": "/account/profilo",
    "nl-nl": "/account/profiel",
    "sv-se": "/konto/profil",
    "en-us": "/account/profile",
    "en-ca": "/account/profile",
    "en-au": "/account/profile",
    "en-ie": "/account/profile",
    "en-gb": "/account/profile",
    "fr-fr": "/compte/profil",
  },
  "/account/addresses": {
    "es-es": "/cuenta/direcciones",
    "de-de": "/konto/adressen",
    "it-it": "/account/indirizzi",
    "nl-nl": "/account/adressen",
    "sv-se": "/konto/adresser",
    "en-us": "/account/addresses",
    "en-ca": "/account/addresses",
    "en-au": "/account/addresses",
    "en-ie": "/account/addresses",
    "en-gb": "/account/addresses",
    "fr-fr": "/compte/adresses",
  },
  "/account/orders": {
    "es-es": "/cuenta/pedidos",
    "de-de": "/konto/bestellungen",
    "it-it": "/account/ordini",
    "nl-nl": "/account/bestellingen",
    "sv-se": "/konto/bestallningar",
    "en-us": "/account/orders",
    "en-ca": "/account/orders",
    "en-au": "/account/orders",
    "en-ie": "/account/orders",
    "en-gb": "/account/orders",
    "fr-fr": "/compte/commandes",
  },
  "/account/orders/details/[id]": {
    "es-es": "/cuenta/pedidos/detalles/[id]",
    "de-de": "/konto/bestellungen/details/[id]",
    "it-it": "/account/ordini/dettagli/[id]",
    "nl-nl": "/account/bestellingen/details/[id]",
    "sv-se": "/konto/bestallningar/detaljer/[id]",
    "en-us": "/account/orders/details/[id]",
    "en-ca": "/account/orders/details/[id]",
    "en-au": "/account/orders/details/[id]",
    "en-ie": "/account/orders/details/[id]",
    "en-gb": "/account/orders/details/[id]",
    "fr-fr": "/compte/commandes/details/[id]",
  },
  "/account/wishlist": {
    "es-es": "/cuenta/lista-de-deseos",
    "de-de": "/konto/wunschliste",
    "it-it": "/account/lista-dei-desideri",
    "nl-nl": "/account/wensenlijst",
    "sv-se": "/konto/onskelista",
    "en-us": "/account/wishlist",
    "en-ca": "/account/wishlist",
    "en-au": "/account/wishlist",
    "en-ie": "/account/wishlist",
    "en-gb": "/account/wishlist",
    "fr-fr": "/compte/liste-de-souhaits",
  },
  "/wishlist/[token]": {
    "es-es": "/lista-de-deseos/[token]",
    "de-de": "/wunschliste/[token]",
    "it-it": "/lista-dei-desideri/[token]",
    "nl-nl": "/wensenlijst/[token]",
    "sv-se": "/onskelista/[token]",
    "en-us": "/wishlist/[token]",
    "en-ca": "/wishlist/[token]",
    "en-au": "/wishlist/[token]",
    "en-ie": "/wishlist/[token]",
    "en-gb": "/wishlist/[token]",
    "fr-fr": "/liste-de-souhaits/[token]",
  },

  // Static Pages
  "/customer-service": {
    "es-es": "/servicio-al-cliente",
    "de-de": "/kundenservice",
    "it-it": "/servizio-clienti",
    "nl-nl": "/klantenservice",
    "sv-se": "/kundtjanst",
    "en-us": "/customer-service",
    "en-ca": "/customer-service",
    "en-au": "/customer-service",
    "en-ie": "/customer-service",
    "en-gb": "/customer-service",
    "fr-fr": "/service-client",
  },
  "/privacy-policy": {
    "es-es": "/politica-privacidad",
    "de-de": "/datenschutz",
    "it-it": "/politica-privacy",
    "nl-nl": "/privacybeleid",
    "sv-se": "/integritetspolicy",
    "en-us": "/privacy-policy",
    "en-ca": "/privacy-policy",
    "en-au": "/privacy-policy",
    "en-ie": "/privacy-policy",
    "en-gb": "/privacy-policy",
    "fr-fr": "/politique-confidentialite",
  },
  "/legal-notice": {
    "es-es": "/aviso-legal",
    "de-de": "/rechtlicher-hinweis",
    "it-it": "/avviso-legale",
    "nl-nl": "/juridische-kennisgeving",
    "sv-se": "/juridisk-anmarkning",
    "en-us": "/legal-notice",
    "en-ca": "/legal-notice",
    "en-au": "/legal-notice",
    "en-ie": "/legal-notice",
    "en-gb": "/legal-notice",
    "fr-fr": "/avis-juridique",
  },
  "/general-terms-of-sale": {
    "es-es": "/condiciones-generales-venta",
    "de-de": "/allgemeine-geschaeftsbedingungen",
    "it-it": "/condizioni-generali-vendita",
    "nl-nl": "/algemene-verkoopvoorwaarden",
    "sv-se": "/allmanna-forsaljningsvillkor",
    "en-us": "/terms-of-sale",
    "en-ca": "/terms-of-sale",
    "en-au": "/terms-of-sale",
    "en-ie": "/terms-of-sale",
    "en-gb": "/terms-of-sale",
    "fr-fr": "/conditions-generales-vente",
  },
  "/terms-of-delivery": {
    "es-es": "/condiciones-entrega",
    "de-de": "/lieferbedingungen",
    "it-it": "/condizioni-consegna",
    "nl-nl": "/leveringsvoorwaarden",
    "sv-se": "/leveransvillkor",
    "en-us": "/terms-of-delivery",
    "en-ca": "/terms-of-delivery",
    "en-au": "/terms-of-delivery",
    "en-ie": "/terms-of-delivery",
    "en-gb": "/terms-of-delivery",
    "fr-fr": "/conditions-livraison",
  },
  "/return-and-refund": {
    "es-es": "/devolucion-reembolso",
    "de-de": "/rueckgabe-rueckerstattung",
    "it-it": "/reso-rimborso",
    "nl-nl": "/retour-restitutie",
    "sv-se": "/retur-aterbetalning",
    "en-us": "/returns-refunds",
    "en-ca": "/returns-refunds",
    "en-au": "/returns-refunds",
    "en-ie": "/returns-refunds",
    "en-gb": "/returns-refunds",
    "fr-fr": "/retours-remboursements",
  },
  "/measurement-guide": {
    "es-es": "/guia-tallas",
    "de-de": "/groessentabelle",
    "it-it": "/guida-taglie",
    "nl-nl": "/maattabel",
    "sv-se": "/storleksgard",
    "en-us": "/measurement-guide",
    "en-ca": "/measurement-guide",
    "en-au": "/measurement-guide",
    "en-ie": "/measurement-guide",
    "en-gb": "/measurement-guide",
    "fr-fr": "/guide-tailles",
  },
  "/humanitarian-project": {
    "es-es": "/proyecto-humanitario",
    "de-de": "/humanitaeres-projekt",
    "it-it": "/progetto-umanitario",
    "nl-nl": "/humanitair-project",
    "sv-se": "/humanitaert-projekt",
    "en-us": "/humanitarian-project",
    "en-ca": "/humanitarian-project",
    "en-au": "/humanitarian-project",
    "en-ie": "/humanitarian-project",
    "en-gb": "/humanitarian-project",
    "fr-fr": "/projet-humanitaire",
  },
    "/[...category]": {
    "es-es": "/[...category]",
    "de-de": "/[...category]",
    "it-it": "/[...category]",
    "nl-nl": "/[...category]",
    "sv-se": "/[...category]",
    "en-us": "/[...category]",
    "en-ca": "/[...category]",
    "en-au": "/[...category]",
    "en-ie": "/[...category]",
    "en-gb": "/[...category]",
    "fr-fr": "/[...category]",
  }
}

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [...locales],

  // Used when no locale matches
  defaultLocale,

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames,
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  permanentRedirect,
  getPathname,
} = createNavigation(routing)
