import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { getResaleData } from "../../../services/economy";
import CatalogDetailsPage from "../stores/catalogDetailsPage";
import dayjs from "dayjs";

const useSaleHistoryStyles = createUseStyles({
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '14px',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#757575',
  },
  legendSwatch: {
    width: '14px',
    height: '3px',
    borderRadius: '2px',
    background: '#008000',
  },
  legendSwatchVolume: {
    background: '#4169E1',
  },
  legendSwatchColorBar: {
    width: '18px',
    height: '10px',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdown: {
    appearance: 'none',
    background: '#f2f2f2',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '6px 28px 6px 12px',
    fontSize: '13px',
    color: '#191919',
    cursor: 'pointer',
    outline: 'none',
  },
  noSales: {
    color: '#757575',
    textAlign: 'center',
    padding: '40px 0',
  },
  chartArea: {
    minHeight: '220px',
  },
  divider: {
    borderTop: '1px solid #e5e5e5',
    margin: '14px -10px 0',
    paddingTop: '14px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '12px',
  },
  stat: {
    textAlign: 'center',
    minWidth: '110px',
  },
  statName: {
    color: '#757575',
    fontSize: '12px',
    marginBottom: '2px',
  },
  statValue: {
    color: '#191919',
    fontSize: '18px',
    fontWeight: 600,
  },
  rap: {
    color: '#060',
    fontWeight: '600',
  },
});

const formatGraphTicks = (v, axis) => {
  var result;
  if (v > 1000000000) {
    result = (v / 1000000000).toFixed(axis.tickDecimals) + "B R$";
  } else if (v > 1000000) {
    result = (v / 1000000).toFixed(axis.tickDecimals) + "M R$";
  }
  else {
    result = v.toFixed(axis.tickDecimals);
  }

  return result.toLocaleString() + " R$";
}

const SaleHistory = props => {
  const store = CatalogDetailsPage.useContainer();
  const [rap, setRap] = useState(null);
  const [rapChart, setRapChart] = useState(null);
  const [volumeChart, setVolumeChart] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const s = useSaleHistoryStyles();

  useEffect(() => {
    if (!store.details) return;
    getResaleData({ assetId: store.details.id }).then(resaleData => {
      setRap(resaleData.recentAveragePrice);
      setRapChart(resaleData.priceDataPoints);
      setVolumeChart(resaleData.volumeDataPoints);
      if (store.saleCount === 0) {
        store.setSaleCount(resaleData.sales);
      }
    });
  }, [store.details]);

  useEffect(() => {
    const el = document.getElementById('placeholder');
    if (!rapChart || !volumeChart) {
      return;
    }
    const hasData = rapChart.some(v => typeof v.value === 'number' && v.value > 0) ||
      volumeChart.some(v => typeof v.value === 'number' && v.value > 0);
    setShowChart(hasData);
    if (!hasData) return;
    const rapData = rapChart.map(v => {
      return [
        dayjs(v.date).unix() * 1000,
        v.value,
      ]
    });
    const volumeData = volumeChart.map(v => {
      return [
        dayjs(v.date).unix() * 1000,
        v.value,
      ]
    })
    // @ts-ignore
    if (!window.RobloxItemChartLibrary) {
      const saleChartScript = document.createElement('script');
      saleChartScript.setAttribute('src', '/js/itemSaleChart.js?refresh=1');
      saleChartScript.onload = function () {
        // @ts-ignore
        window.RobloxItemChartLibrary.loadChart(rapData, volumeData);
      }
      document.body.appendChild(saleChartScript);
    } else {
      // @ts-ignore
      window.RobloxItemChartLibrary.loadChart(rapData, volumeData);
    }
  }, [rapChart, volumeChart]);

  if (!rapChart) {
    return null
  }

  const originalPrice = store.details && store.details.price;

  return <div>
    <div className={s.topRow}>
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendSwatch}></span>
          Recent Average Price
        </span>
        <span className={s.legendItem}>
          <span className={s.legendSwatch + ' ' + s.legendSwatchVolume}></span>
          Volume
        </span>
      </div>
      <div className={s.dropdownWrapper}>
        <select className={s.dropdown}>
          <option>180 Days</option>
        </select>
      </div>
    </div>
    {!showChart ? <p className={s.noSales}>No sales recorded in this period.</p> : <div className={s.chartArea}>
      <div id='placeholder' style={{ width: '100%', height: '220px' }}></div>
      <div id='volumegraph' style={{ width: '100%', height: '60px' }}></div>
    </div>}
    <div className={s.divider}>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Quantity Sold</div>
          <div className={s.statValue}>{store.saleCount.toLocaleString()}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Original Price</div>
          <div className={s.statValue}>{originalPrice !== null && originalPrice !== undefined ? originalPrice.toLocaleString() : 'N/A'}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Average Price</div>
          <div className={s.statValue}>{rap !== null && rap !== undefined ? rap.toLocaleString() : 'N/A'}</div>
        </div>
      </div>
    </div>
  </div>
}

export default SaleHistory;