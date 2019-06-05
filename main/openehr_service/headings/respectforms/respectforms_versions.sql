WITH compversion AS (
  (
    SELECT
      composition.id,
      event_context.start_time,
      composer_party.name AS composer,
      facility_party.name AS facility,
      composition.sys_transaction
    FROM ehr.composition
    JOIN ehr.event_context ON event_context.composition_id=composition.id
    JOIN ehr.party_identified AS composer_party ON composer_party.id=composition.composer
    JOIN ehr.party_identified AS facility_party ON facility_party.id=event_context.facility  
    WHERE ehr.composition.id = '{{uuid}}'
  )
  UNION ALL
  (
    SELECT
      composition_history.id,
      event_context_history.start_time,
      composer_party.name AS composer,
      facility_party.name AS facility,
      composition_history.sys_transaction
    FROM ehr.composition_history
    JOIN ehr.event_context_history ON (event_context_history.composition_id=composition_history.id AND event_context_history.sys_transaction=composition_history.sys_transaction)
    JOIN ehr.party_identified AS composer_party ON composer_party.id=composition_history.composer
    JOIN ehr.party_identified AS facility_party ON facility_party.id=event_context_history.facility   
    WHERE ehr.composition_history.id = '{{uuid}}'
    ORDER BY composition_history.sys_transaction DESC
  )
) SELECT
  row_number() over (ORDER BY sys_transaction) AS version,
  compversion.id,
  compversion.start_time,
  compversion.composer,
  compversion.facility,
  compversion.sys_transaction
FROM compversion