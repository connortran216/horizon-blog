# Home Series carousel

User-approved direction: retain book covers; desktop two full cards, mobile one plus peek; scroll snap, mouse drag, touch scrolling, previous/next controls, current range, no autoplay or infinite loop. All Series remains available.

Implementation: EditorialSeriesShelf owns 6-item API pages, accumulated deduplicated results and retry. SeriesCarousel owns responsive scroll measurements and interaction. Blog's compact shelf is unchanged. Near-end loading keeps existing cards visible. Reduced motion uses immediate navigation.

Checks: lint/types and 18 existing Series/Home tests passed. Live public production data reports 10 Series. Mobile next changed 1 to 2; mouse drag advanced without opening the linked Series. No production data mutations or deployment.
