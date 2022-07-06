import * as React from 'react';
import styles from './SpfxHttpClientDemo.module.scss';
import { ISpfxHttpClientDemoProps } from './ISpfxHttpClientDemoProps';
import { escape } from '@microsoft/sp-lodash-subset';

//! Lsn 4.3.7 Locate the render() method and replace it with the following code. This will create a list displaying the data contained in the spListItems property. Also notice that there's a button that has an onClick handler wired up to it.

export default class SpfxHttpClientDemo extends React.Component<ISpfxHttpClientDemoProps, {}> {
  public render(): React.ReactElement<ISpfxHttpClientDemoProps> {
    const {
      // description,
      spListItems,
      onGetListItems,

      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.spfxHttpClientDemo} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          {/* <div>Web part property value: <strong>{escape(description)}</strong></div> */}
        </div>
        <div className={styles.buttons}>
          <button type="button" onClick={this.onGetListItemsClicked}>Get Countries</button>

         {/* Lsn 4.5.1 Within the render() method in the SpFxHttpClientDemo class, locate the button Get Countries. Add the following markup to add three more buttons to the user interface: */}
          <button type='button' onClick={this.onAddListItemClicked}>Add List Item</button>
          <button type='button' onClick={this.onUpdateListItemClicked}>Update List Item</button>
          <button type='button' onClick={this.onDeleteListItemClicked}>Delete List Item</button>
        </div>

        <div>
          <ul>
            {spListItems && spListItems.map((list) =>
              <li key={list.Id}>
                <strong>Id:</strong> {list.Id}, <strong>Title:</strong> {list.Title}
              </li>
            )
            }
          </ul>
        </div>

      </section>
    );
  }

  //! Lsn 4.3.8 Add the following event handler to the SpFxHttpClientDemo class to handle the click event on the button. This code will prevent the default action of the <a> element from navigating away from (or refreshing) the page and call the callback set on the public property, notifying the consumer of the component an event occurred.
  private onGetListItemsClicked = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
  
    this.props.onGetListItems();
  }

  //! Lsn 4.5.2 Add the following event handlers to the SpFxHttpClientDemo class:
  private onAddListItemClicked = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    this.props.onAddListItem();
  }
  private onUpdateListItemClicked = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    this.props.onUpdateListItem();
  }
  private onDeleteListItemClicked = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    this.props.onDeleteListItem();
  }
}
