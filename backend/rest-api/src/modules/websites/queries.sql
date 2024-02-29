/*
  @name CreateWebsiteQuery
  @param website -> (userId!, title!, metaDescription)
*/
INSERT INTO website (user_id, title, meta_description) VALUES :website;

/* @name FindAllWebsitesQuery */
SELECT * FROM website WHERE user_id = :userId!;

/* @name FindWebsiteByIdQuery */
SELECT * FROM website WHERE id = :id! AND user_id = :userId!;

/* @name UpdateWebsiteQuery */
UPDATE website SET title = COALESCE(:title, title), meta_description = COALESCE(:metaDescription, meta_description) WHERE id = :id! AND user_id = :userId!;

/* @name DeleteWebsiteQuery */
DELETE FROM website WHERE id = :id! AND user_id = :userId!;