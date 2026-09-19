import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./App.css";

const format = (n) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const toNumber = (v) => parseFloat(String(v).replace(/,/g, ".")) || 0;

const cleanNumber = (v) =>
  v
    .replace(/[^0-9.,]/g, "")
    .replace(/,/g, ".")
    .replace(/^(\d*\.\d{0,2}).*$/, "$1")
    .replace(/^0+(?=\d)/, "");

const NumberField = ({
  label,
  value,
  onChange,
  placeholder = "0,00",
  readOnly = false,
  suffix,
  className = "",
}) => (
  <label className={`field ${readOnly ? "is-readonly" : ""} ${className}`}>
    {label ? <span className="field-label">{label}</span> : null}
    <span className={`field-box ${suffix ? "has-suffix" : ""}`}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {suffix ? <span className="field-suffix">{suffix}</span> : null}
    </span>
  </label>
);

const App = () => {
  const [usdToPesos, setUsdToPesos] = useState("1");
  const [usdToBs, setUsdToBs] = useState("1");
  const [bsPer1kPesos, setBsPer1k] = useState("27");

  const [bsMonto, setBsMonto] = useState("");
  const [pesos, setPesos] = useState("");
  const [usd, setUsd] = useState("");
  const [bs, setBs] = useState("");

  const [lastUpdate, setLastUpdate] = useState("");
  const [actYear, setActYear] = useState("");

  const [bsToUsd, setBsToUsd] = useState("");
  const [usdToBsConv, setUsdToBsConv] = useState("");
  const [copToUsd, setCopToUsd] = useState("");
  const [usdToCop, setUsdToCop] = useState("");
  const [bsToCop, setBsToCop] = useState("");
  const [copToBs, setCopToBs] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const usdToCopRate = parseFloat(data.rates.COP.toFixed(2));
        setUsdToPesos(usdToCopRate.toString());
        const usdToBsInicial = parseFloat(data.rates.VES.toFixed(2));
        setUsdToBs(usdToBsInicial.toString());

        const [y, m, d] = data.date.split("-");
        const meses = [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ];
        setLastUpdate(`${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]}`);
        setActYear(y);
      } catch (err) {
        console.error("Error obteniendo tasa:", err);
      }
    })();
  }, []);

  const handle = (setter) => (e) => setter(cleanNumber(e.target.value));

  const resetValores = () => {
    setBsMonto("");
    setPesos("");
    setUsd("");
    setBs("");
    setBsToUsd("");
    setUsdToBsConv("");
    setCopToUsd("");
    setUsdToCop("");
    setBsToCop("");
    setCopToBs("");
  };

  const pesosMontoCalculado = useMemo(() => {
    const bsVal = toNumber(bsMonto);
    const rBs1k = parseFloat(bsPer1kPesos) || 1;
    return format(bsVal * rBs1k);
  }, [bsMonto, bsPer1kPesos]);

  const {
    usdPesosStr,
    bsPesosStr,
    totalPesosStr,
    faltanteBs,
    faltanteUsd,
    faltanteStr,
    vueltoStr,
    faltanteNum,
    vueltoNum,
  } = useMemo(() => {
    const rUsdPesos = parseFloat(usdToPesos) || 0;
    const rUsdBs = parseFloat(usdToBs) || 1;
    const usdVal = toNumber(usd);
    const pesosVal = toNumber(pesos);
    const bsVal = toNumber(bs);
    const bsMontoVal = toNumber(bsMonto);
    const rBs1k = parseFloat(bsPer1kPesos) || 1;

    const montoObjetivoEnPesos = bsMontoVal * rBs1k;
    const usdPesos = usdVal * rUsdPesos;
    const bsPesos = bsVal * rBs1k;
    const total = pesosVal + usdPesos + bsPesos;

    const falt = Math.max(0, montoObjetivoEnPesos - total);
    const vuelto = Math.max(0, total - montoObjetivoEnPesos);

    return {
      usdPesosStr: format(usdPesos),
      bsPesosStr: format(bsPesos),
      totalPesosStr: format(total),
      faltanteStr: format(falt),
      faltanteBs: format(rUsdPesos ? (falt * rUsdBs) / rUsdPesos : 0),
      faltanteUsd: format(rUsdPesos ? falt / rUsdPesos : 0),
      vueltoStr: format(vuelto),
      faltanteNum: falt,
      vueltoNum: vuelto,
    };
  }, [usd, pesos, bs, bsMonto, usdToPesos, usdToBs, bsPer1kPesos]);

  const convertBsToUsd = useMemo(() => {
    const rate = parseFloat(usdToBs);
    return rate ? format(toNumber(bsToUsd) / rate) : "0,00";
  }, [bsToUsd, usdToBs]);

  const convertUsdToBs = useMemo(() => {
    const rate = parseFloat(usdToBs);
    return rate ? format(toNumber(usdToBsConv) * rate) : "0,00";
  }, [usdToBsConv, usdToBs]);

  const convertCopToUsd = useMemo(() => {
    const rate = parseFloat(usdToPesos);
    return rate ? format(toNumber(copToUsd) / rate) : "0,00";
  }, [copToUsd, usdToPesos]);

  const convertUsdToCop = useMemo(() => {
    const rate = parseFloat(usdToPesos);
    return rate ? format(toNumber(usdToCop) * rate) : "0,00";
  }, [usdToCop, usdToPesos]);

  const convertBsToCop = useMemo(() => {
    const rate = parseFloat(bsPer1kPesos) || 1;
    return format(toNumber(bsToCop) * rate);
  }, [bsToCop, bsPer1kPesos]);

  const convertCopToBs = useMemo(() => {
    const rate = parseFloat(bsPer1kPesos) || 1;
    return format(toNumber(copToBs) / rate);
  }, [copToBs, bsPer1kPesos]);

  const publicAsset = (file) => {
    const base = process.env.PUBLIC_URL || "";
    if (!base || base === ".") return `/${file}`;
    return `${base.replace(/\/$/, "")}/${file}`;
  };

  return (
    <div
      className="app-shell"
      style={{
        "--bg-hor": `url("${publicAsset("background_hor.png")}")`,
        "--bg-ver": `url("${publicAsset("background_ver.png")}")`,
      }}
    >
      <div className="app-container">
        <header className="app-header">
          <h1 className="title">BS · PESOS · USD</h1>
        </header>

        <section className="card card-pay">
          <div className="card-head">
            <h2>Monto a pagar</h2>
            <button
              type="button"
              className="btn-clear"
              onClick={resetValores}
              title="Reiniciar valores"
              aria-label="Limpiar"
            >
              C
            </button>
          </div>
          <div className="pair">
            <NumberField
              label="Bolívares"
              value={bsMonto}
              onChange={handle(setBsMonto)}
            />
            <NumberField
              label="Pesos"
              value={pesosMontoCalculado}
              readOnly
            />
          </div>
        </section>

        <section className="card card-receive">
          <h2>Dinero recibido</h2>
          <NumberField
            label="Pesos recibidos"
            value={pesos}
            onChange={handle(setPesos)}
            suffix="PESOS"
          />
          <div className="pair">
            <NumberField
              label="Dólares recibidos"
              value={usd}
              onChange={handle(setUsd)}
            />
            <NumberField label="En pesos" value={usdPesosStr} readOnly suffix="PESOS" />
          </div>
          <div className="pair">
            <NumberField
              label="Bolívares recibidos"
              value={bs}
              onChange={handle(setBs)}
            />
            <NumberField label="En pesos" value={bsPesosStr} readOnly suffix="PESOS" />
          </div>
        </section>

        <section className="card card-summary">
          <h2>Resumen</h2>
          <NumberField
            label="Total recibido"
            value={totalPesosStr}
            readOnly
            suffix="PESOS"
          />

          <div className={`highlight ${faltanteNum > 0 ? "is-on is-faltante" : ""}`}>
            <p className="highlight-title">Dinero faltante</p>
            <div className="trio">
              <NumberField label="Bolívares" value={faltanteBs} readOnly />
              <NumberField label="Pesos" value={faltanteStr} readOnly />
              <NumberField label="Dólares" value={faltanteUsd} readOnly />
            </div>
          </div>

          <div className={`highlight ${vueltoNum > 0 ? "is-on is-vuelto" : ""}`}>
            <NumberField
              label="Total vuelto"
              value={vueltoStr}
              readOnly
              suffix="PESOS"
            />
          </div>
        </section>

        <section className="card card-rates">
          <h2>Tasas de cambio</h2>
          <div className="rate-grid">
            <label className="rate-row">
              <span className="rate-prefix">1 USD =</span>
              <input
                className="rate-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={usdToPesos}
                onChange={handle(setUsdToPesos)}
              />
              <span className="rate-unit">PESOS</span>
            </label>
            <label className="rate-row">
              <span className="rate-prefix">1 PESO =</span>
              <input
                className="rate-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={bsPer1kPesos}
                onChange={handle(setBsPer1k)}
              />
              <span className="rate-unit">BS</span>
            </label>
            <label className="rate-row">
              <span className="rate-prefix">1 USD =</span>
              <input
                className="rate-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={usdToBs}
                onChange={handle(setUsdToBs)}
              />
              <span className="rate-unit">BS</span>
            </label>
          </div>
        </section>

        <section className="card card-convert">
          <h2>Conversores</h2>
          <div className="convert-list">
            <div className="convert-item">
              <p>Bolívares a dólares</p>
              <div className="pair">
                <NumberField value={bsToUsd} onChange={handle(setBsToUsd)} />
                <NumberField value={convertBsToUsd} readOnly suffix="USD" />
              </div>
            </div>
            <div className="convert-item">
              <p>Dólares a bolívares</p>
              <div className="pair">
                <NumberField value={usdToBsConv} onChange={handle(setUsdToBsConv)} />
                <NumberField value={convertUsdToBs} readOnly suffix="BS" />
              </div>
            </div>
            <div className="convert-item">
              <p>Pesos a dólares</p>
              <div className="pair">
                <NumberField value={copToUsd} onChange={handle(setCopToUsd)} />
                <NumberField value={convertCopToUsd} readOnly suffix="USD" />
              </div>
            </div>
            <div className="convert-item">
              <p>Dólares a pesos</p>
              <div className="pair">
                <NumberField value={usdToCop} onChange={handle(setUsdToCop)} />
                <NumberField value={convertUsdToCop} readOnly suffix="PESOS" />
              </div>
            </div>
            <div className="convert-item">
              <p>Bolívares a pesos</p>
              <div className="pair">
                <NumberField value={bsToCop} onChange={handle(setBsToCop)} />
                <NumberField value={convertBsToCop} readOnly suffix="PESOS" />
              </div>
            </div>
            <div className="convert-item">
              <p>Pesos a bolívares</p>
              <div className="pair">
                <NumberField value={copToBs} onChange={handle(setCopToBs)} />
                <NumberField value={convertCopToBs} readOnly suffix="BS" />
              </div>
            </div>
          </div>
        </section>

        <footer className="app-footer">
          <p>{lastUpdate ? `Actualizado al ${lastUpdate}` : "Tasas listas para editar"}</p>
          <p>
            © {actYear || new Date().getFullYear()}{" "}
            <a href="https://wa.me/51980675172" className="name">
              Cristian Cáceres
              <i className="fab fa-whatsapp whatsapp-icon" />
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
