/*
  @name CreateWebsiteQuery
  @param website -> (userId!, title!, metaDescription)
*/
INSERT INTO website_structure.website (user_id, title, meta_description) VALUES :website;

/* @name FindAllWebsitesQuery */
SELECT * FROM website_structure.website WHERE user_id = :userId!;

/* @name FindWebsiteByIdQuery */
SELECT * FROM website_structure.website WHERE id = :id! AND user_id = :userId!;

/* @name UpdateWebsiteQuery */
UPDATE website_structure.website SET title = COALESCE(:title, title), meta_description = COALESCE(:metaDescription, meta_description) WHERE id = :id! AND user_id = :userId!;

/* @name DeleteWebsiteQuery */
DELETE FROM website_structure.website WHERE id = :id! AND user_id = :userId!;