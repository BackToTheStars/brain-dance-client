import { getGameSettings, updateGameSettings } from "@/modules/game/game-redux/storage";

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

export const getPersonalizedPanelSettings = (hash, dPanels) => {
  const currentSettings = getGameSettings(hash)?.panels;
  if (!currentSettings) {
    return dPanels;
  }

  const modifiedPanels = {
    ...dPanels
  };

  for (const [key, value] of Object.entries(currentSettings)) {
    if (!modifiedPanels[key]) {
      continue;
    }
    modifiedPanels[key] = {
      ...dPanels[key],
      ...value,
    };
  }

  return modifiedPanels;
}