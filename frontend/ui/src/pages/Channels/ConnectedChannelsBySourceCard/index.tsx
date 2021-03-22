import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';

import {LinkButton} from '@airyhq/components';
import {Channel} from 'httpclient';
import {SourceTypeInfo} from '../MainPage';
import SourceLogo from '../../../components/SourceLogo';
import {ReactComponent as PlusCircleIcon} from 'assets/images/icons/plus-circle.svg';

import styles from './index.module.scss';

type ConnectedChannelsBySourceCardProps = {
  sourceTypeInfo: SourceTypeInfo;
  channels: Channel[];
  connected: string;
  dataCyAddChannelButton?: string;
  dataCyChannelList?: string;
};

const ConnectedChannelsBySourceCard = (props: ConnectedChannelsBySourceCardProps & RouteComponentProps) => {
  const {sourceTypeInfo, channels, dataCyChannelList, dataCyAddChannelButton} = props;

  const hasExtraChannels = channels.length > sourceTypeInfo.channelsToShow;

  return (
    <>
      {channels && channels.length > 0 && (
        <>
          <div className={styles.connectedContainer}>
            <div className={styles.connectedSum}>
              <p>
                {channels.length} {props.connected}
              </p>
            </div>
            <div
              className={styles.connectedChannelBox}
              onClick={() => props.history.push(sourceTypeInfo.channelsListRoute)}>
              <div className={styles.connectedChannel} data-cy={dataCyChannelList}>
                {channels.slice(0, sourceTypeInfo.channelsToShow).map((channel: Channel) => {
                  return (
                    <li key={channel.sourceChannelId} className={styles.channelListEntry}>
                      <button className={styles.connectedChannelData}>
                        <SourceLogo channel={channel} style={{width: '20px', height: '20px', marginRight: '4px'}} />
                        <div className={styles.connectedChannelName}>{channel.metadata?.name}</div>
                        {sourceTypeInfo.channelsToShow === 2 && (
                          <div className={styles.extraPhoneInfo}>{channel.sourceChannelId}</div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </div>
              <div className={styles.extraChannel}>
                {hasExtraChannels && (
                  <LinkButton>
                    +{channels.length - sourceTypeInfo.channelsToShow} {sourceTypeInfo.itemInfoString}
                  </LinkButton>
                )}
              </div>
            </div>
          </div>

          <div className={styles.channelButton}>
            <button
              type="button"
              className={styles.addChannelButton}
              onClick={() => props.history.push(sourceTypeInfo.newChannelRoute)}
              data-cy={dataCyAddChannelButton}>
              <div className={styles.channelButtonIcon} title="Add a channel">
                <PlusCircleIcon />
              </div>
            </button>
          </div>
        </>
      )}
    </>
  );
};
export default withRouter(ConnectedChannelsBySourceCard);
