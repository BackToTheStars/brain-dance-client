import { getGameSettings, updateGameSettings } from "@/modules/game/game-redux/storage";
import { MINIMAP_SIZE_MAX, MINIMAP_SIZE_MIN } from "@/config/panel";
import { getStore, lsUpdateLayoutSettings } from "@/modules/settings/redux/requests";

const getPanelSettingsPartForSave = (d) => {
  const fields = {};
  for (const panel of Object.values(d)) {
    if (panel?.fieldsToSave?.length > 0) {
      fields[panel.type] = {};
      for (const field of panel.fieldsToSave) {
        fields[panel.type][field] = panel[field];
      }
    }
  }
  return fields;
}

export const savePanelsSettings = (hash, dPanels) => {
  updateGameSettings(hash, "panels", getPanelSettingsPartForSave(dPanels));
}

// Только поля из fieldsToSave: прежние записи на игру полей, переехавших на
// пользователя, не читаются.
export const getPersonalizedPanelSettings = (hash, dPanels) => {
  const currentSettings = getGameSettings(hash)?.panels;
  if (!currentSettings) {
    return dPanels;
  }

  const modifiedPanels = {
    ...dPanels
  };

  for (const [key, value] of Object.entries(currentSettings)) {
    const fields = modifiedPanels[key]?.fieldsToSave;
    if (!fields?.length) {
      continue;
    }
    const saved = {};
    for (const field of fields) {
      if (field in value) saved[field] = value[field];
    }
    modifiedPanels[key] = {
      ...dPanels[key],
      ...saved,
    };
  }

  return modifiedPanels;
}

// Настройки панелей на пользователя: userSettings.layoutSettings.panels[<тип>] —
// поля из userFields описания панели. Только на клиенте.

const isValidUserField = (field, value) => {
  switch (field) {
    case "isDisplayed":
    case "isMinimized":
      return typeof value === "boolean";
    case "size":
      return Number.isFinite(value) && value >= MINIMAP_SIZE_MIN && value <= MINIMAP_SIZE_MAX;
    case "place":
      return value === null || (Number.isFinite(value?.left) && Number.isFinite(value?.top));
    default:
      return false;
  }
};

export const pickUserFields = (panel) => {
  const fields = {};
  for (const field of panel.userFields) {
    fields[field] = panel[field];
  }
  return fields;
};

// Записанное и годное — только поля из userFields; остальное молча пропускается.
export const readUserPanelFields = (panel) => {
  const stored = getStore().layoutSettings?.panels?.[panel.type];
  const fields = {};
  if (!stored || typeof stored !== "object") return fields;
  for (const field of panel.userFields) {
    if (field in stored && isValidUserField(field, stored[field])) {
      fields[field] = stored[field];
    }
  }
  return fields;
};

// lsUpdateLayoutSettings сливает только верхний уровень, поэтому panels
// сливается здесь.
export const saveUserPanelFields = (panel) => {
  const { panels = {} } = getStore().layoutSettings || {};
  lsUpdateLayoutSettings({
    panels: { ...panels, [panel.type]: pickUserFields(panel) },
  });
};
