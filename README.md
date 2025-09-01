# Offerteplatform

### Cache/CORS
Het werkprogramma-briefpapier wordt vanaf acwbv.nl geladen met `crossOrigin="anonymous"`. Zorg dat de server `Access-Control-Allow-Origin`-headers meestuurt en dat oude versies niet uit de cache worden gehaald, anders verschijnen er CORS- of verouderingsproblemen bij de preview en export.
