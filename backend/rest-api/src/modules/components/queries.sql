/*
  @name CreateComponentQuery
  @param component -> (type!, pageId!, content!, assetId)
*/
INSERT INTO components.component (type, page_id, content, asset_id) VALUES :component;

/* @name UpdateComponentQuery */
UPDATE components.component SET content = COALESCE(:content, content), asset_id = COALESCE(:assetId, asset_id) WHERE id = :componentId! AND page_id = :pageId!;

/* @name DeleteComponentQuery */
DELETE FROM components.component WHERE id = :componentId! AND page_id = :pageId!;

/* @name FindComponentByIdQuery */
SELECT * FROM components.component WHERE id = :componentId! AND page_id = :pageId!;

/* @name FindAllComponentsQuery */
SELECT * FROM components.component WHERE page_id = :pageId!;