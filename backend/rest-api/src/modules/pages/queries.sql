/*
  @name CreatePageQuery
  @param page -> (websiteId!, route!, title, metaDescription)
*/
INSERT INTO website_structure.page (website_id, route, title, meta_description) VALUES :page;

/* @name FindAllPagesQuery */
SELECT * FROM website_structure.page WHERE website_id = :websiteId!;

/* @name FindPageByIdQuery */
SELECT * FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!;

/* @name UpdatePageQuery */
UPDATE website_structure.page SET route = COALESCE(:route, route), title = COALESCE(:title, title), meta_description = COALESCE(:metaDescription, meta_description) WHERE id = :id! AND website_id = :websiteId!;

/* @name DeletePageQuery */
DELETE FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!;