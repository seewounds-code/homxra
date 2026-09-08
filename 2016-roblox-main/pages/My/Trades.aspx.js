import React from "react";
import TradeStore from "../../components/myMoney/stores/tradeStore";
import ThumbnailStore from "../../stores/thumbnailStore";
import TradesPage from "../../components/tradesPage";

const MyTradesPage = props => {
  return <ThumbnailStore.Provider>
    <TradeStore.Provider>
      <TradesPage />
    </TradeStore.Provider>
  </ThumbnailStore.Provider>
}

export default MyTradesPage;
