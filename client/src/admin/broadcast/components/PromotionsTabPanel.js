import React, { useState, useEffect } from "react";
import PageState from "../constants/PageState";
import { getAllPromotions } from "../data/api";
import BroadcastCard from "./BroadcastCard";
import CenteredProgress from "./misc/centeredProgress";
import useBroadcastDetails from "./broadcast_details/useBroadcastDetails";
import ErrorCard from "./misc/ErrorCard";
import useUpdateBroadcast from "./update_broadcast/useUpdateBroadcast";
import Nothing from '../../../assets/nothing.svg'

const PromotionsTabPanel = () => {
  const { handleShowBroadcastDetails, BroadcastDetails } =
    useBroadcastDetails();

  const [pageState, setPageState] = useState(PageState.loading);

  const { showUpdateBroadcast, UpdateBroadcast } = useUpdateBroadcast();

  const [data, setData] = useState([]);

  const [refresh, setrefresh] = useState(false);

  useEffect(() => {
    setPageState(PageState.loading);
    getAllPromotions()
      .then((response) => {
        if (response.status === 200) {
          response.json().then((result) => {
            console.log(result);
            setData(result);
            setPageState(PageState.loaded);
          });
        } else {
          setPageState(PageState.error);
        }
      })
      .catch(() => setPageState(PageState.error));
  }, [refresh]);

  const PageStateHandler = (state) => {
    switch (state) {
      case PageState.loading:
        return <CenteredProgress />;
      case PageState.loaded:
        if(data.length <= 0){
          return <img src={Nothing} alt="No data found yet" height="500em" width="100%"/>
        }

        return (
          <div>
            {data.map((broadcast) => {
              return (
                <BroadcastCard
                  id={broadcast._id}
                  images={broadcast.images}
                  title={broadcast.title}
                  body={broadcast.body}
                  published={broadcast.published}
                  target={broadcast.target}
                  onClickMore={() => {
                    handleShowBroadcastDetails(broadcast);
                  }}
                  onClickPublished={() => {
                    setrefresh(!refresh);
                  }}
                  onClickUpdate={() => {
                    showUpdateBroadcast(broadcast);
                  }}
                  onDelete={() => {
                    setrefresh(!refresh);
                  }}
                />
              );
            })}
          </div>
        );
      case PageState.error:
        return <ErrorCard />;
      default:
        return <ErrorCard />;
    }
  };

  return (
    <div>
      {PageStateHandler(pageState)}
      <BroadcastDetails
        onClickPublished={() => {
          setrefresh(!refresh);
        }}
      />
      <UpdateBroadcast
        onUpdate={() => {
          setrefresh(!refresh);
        }}
      />
    </div>
  );
};

export default PromotionsTabPanel;
