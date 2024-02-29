/*
  @name CreateWebsiteQuery
  @param website -> (userId!, title!, meta_description)
*/
INSERT INTO website (user_id, title, meta_description) VALUES :website;

/* @name FindAllWebsitesQuery */
SELECT * FROM website WHERE user_id = :userId!;

/* @name FindWebsiteByIdQuery */
SELECT * FROM website WHERE id = :id! AND user_id = :userId!;

/* @name UpdateWebsiteQuery */
UPDATE website SET title = :title, meta_description = :metaDescription WHERE id = :id! AND user_id = :userId!;

/* @name DeleteWebsiteQuery */
DELETE FROM website WHERE id = :id! AND user_id = :userId!;