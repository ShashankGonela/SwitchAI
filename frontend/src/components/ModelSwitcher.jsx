import React, { useEffect, useState } from "react";
import { getModels } from "../api/client";
const models = [
  { name: "GPT-4o Mini (OpenAI)", value: "gpt-4o-mini" },
  { name: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { name: "Gemini 2.5 Pro", value: "gemini-2.5-pro" }
];

export default function ModelSwitcher({ value, onChange }) {
  return (
    <div className="model-switcher">
      <label htmlFor="model-select">Model</label>
      <select
        id="model-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ marginLeft: 8 }}
      >
        {models.map(m => (
          <option key={m.value} value={m.value}>{m.name}</option>
        ))}
      </select>
    </div>
  );
}
