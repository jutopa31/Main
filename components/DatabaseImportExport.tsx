'use client'
import React, { useRef } from "react";
import CryptoJS from "crypto-js";

const DatabaseImportExport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exportar localStorage cifrado
  const handleExport = async () => {
    const password = prompt("Ingrese una contraseña para cifrar los datos:");
    if (!password) return;
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) data[key] = localStorage.getItem(key) ?? "";
    }
    const jsonData = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonData, password).toString();
    const blob = new Blob([
      JSON.stringify({ encrypted }, null, 2)
    ], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "base_de_datos_cifrada.json";
    a.click();
    URL.revokeObjectURL(url);
    alert("Exportación completada. ¡Guarde el archivo en un lugar seguro!");
  };

  // Importar localStorage cifrado
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const password = prompt("Ingrese la contraseña para descifrar los datos:");
    if (!password) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { encrypted } = JSON.parse(content);
        const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Contraseña incorrecta o archivo corrupto");
        const data = JSON.parse(decrypted);
        // Limpiar localStorage antes de restaurar
        localStorage.clear();
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
        alert("Importación completada. Recargue la página para ver los cambios.");
      } catch (err) {
        alert("Error al importar: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Limpiar el input para permitir importar el mismo archivo de nuevo si es necesario
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", margin: 16 }}>
      <button onClick={handleExport} style={{ padding: 8, background: '#2563eb', color: 'white', borderRadius: 4 }}>
        Exportar base de datos
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImport}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{ padding: 8, background: '#22c55e', color: 'white', borderRadius: 4 }}
      >
        Importar base de datos
      </button>
    </div>
  );
};

export default DatabaseImportExport; 