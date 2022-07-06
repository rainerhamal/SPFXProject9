import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SpfxHttpClientDemoWebPartStrings';
import SpfxHttpClientDemo from './components/SpfxHttpClientDemo';
import { ISpfxHttpClientDemoProps } from './components/ISpfxHttpClientDemoProps';

//! Lsn 4.3.9 After the existing import statements at the top of the file, add the following import statements:
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ICountryListItem } from '../../models';
import { List } from 'office-ui-fabric-react';

export interface ISpfxHttpClientDemoWebPartProps {
  description: string;
}

export default class SpfxHttpClientDemoWebPart extends BaseClientSideWebPart<ISpfxHttpClientDemoWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  //! Lsn 4.3.10 Locate the class SpFxHttpClientDemoWebPart and add the following private member to it:
  private _countries: ICountryListItem[] = [];

  protected onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<ISpfxHttpClientDemoProps> = React.createElement(
      SpfxHttpClientDemo,
      {
        // description: this.properties.description,
        //! Lsn 4.3.11 Locate the render() method. Notice that this method is creating an instance of the component SpFxHttpClientDemo and then setting its public properties. The default code sets the description property, however this was removed from the interface ISpFxHttpClientDemoProps in the previous steps. Remove the description property and add the following properties to set the list of countries to the private member added above and attach to the event handler:
        spListItems: this._countries,
        onGetListItems: this._onGetListItems,

        //! Lsn 4.5.3 Update the public properties to add handlers for the events when buttons are pressed in the component:
        onAddListItem: this._onAddListItem,
        onUpdateListItem: this._onUpdateListItem,
        onDeleteListItem: this._onDeleteListItem,

        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  //! Lsn 4.3.12 This method calls another method (that you'll add in the next step) that returns a collection of list items. Once those items are returned via a JavaScript Promise, the method updates the internal _countries member and re-renders the web part. This will bind the collection of countries returned by the _getListItems() method to the public property on the React component that will render the items.
  private _onGetListItems = (): void => {
    this._getListItems()
      .then(response => {
        this._countries = response;
        this.render();
      });
  }

  //! Lsn 4.3.13 The method retrieves list items from the Countries list using the SharePoint REST API. It will use the spHttpClient object to query the SharePoint REST API. When it receives the response, it calls response.json() that will process the response as a JSON object and then returns the value property in the response to the caller. The value property is a collection of list items that match the interface created previously.
  private _getListItems(): Promise<ICountryListItem[]> {
    return this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')/items?$select=Id,Title`,
      SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.value;
      }) as Promise<ICountryListItem[]>;
  }

  //! Lsn 4.5.4 Implement the three event handlers you just added.
  private _onAddListItem = (): void => {
    this._addListItem()
      .then(() => {
        this._getListItems()
          .then(response => {
            this._countries = response;
            this.render();
          });
      });
  }
  private _onUpdateListItem = (): void => {
    this._updateListItem()
      .then(() => {
        this._getListItems()
          .then(response => {
            this._countries = response;
            this.render();
          });
      });
  }
  private _onDeleteListItem = (): void => {
    this._deleteListItem()
      .then(() => {
        this._getListItems()
          .then(response => {
            this._countries = response;
            this.render();
          });
      });
  }

  //! Lsn 4.5.5 These event handlers will call different methods, which you'll add in the rest of this exercise. Each one will add, update, or delete an item in the SharePoint list, call the existing _getListItems() method you created in the previous exercise, and refresh the web part by calling render().
  //? Add the following methods to the SpFxHttpClientDemoWebPart class to add a new item to the list:
  private _getItemEntityType(): Promise<string> {
    return this.context.spHttpClient.get(
        this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')?$select=ListItemEntityTypeFullName`,
        SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.ListItemEntityTypeFullName;
      }) as Promise<string>;
  }
  
  private _addListItem(): Promise<SPHttpClientResponse> {
    return this._getItemEntityType()
      .then(spEntityType => {
        const request: any = {};
        request.body = JSON.stringify({
          Title: new Date().toUTCString(),
          '@odata.type': spEntityType
        });
  
        return this.context.spHttpClient.post(
          this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')/items`,
          SPHttpClient.configurations.v1,
          request);
      });
  }

  //? Add the following method to the SpFxHttpClientDemoWebPart class to update an item in the list:
  private _updateListItem(): Promise<SPHttpClientResponse> {
    //* get the first item
    return this.context.spHttpClient.get(
        this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')/items?$select=Id,Title&$filter=Title eq 'United States'`,
        SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.value[0];
      })
      .then((listItem: ICountryListItem) => {
        //*update item
        listItem.Title = 'USA';
        //*save it
        const request: any = {};
        request.headers = {
          'X-HTTP-METHOD': 'MERGE',
          'IF-MATCH': (listItem as any)['@odata.etag']
        };
        request.body = JSON.stringify(listItem);

        return this.context.spHttpClient.post(
          this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')/items(${listItem.Id})`,
          SPHttpClient.configurations.v1,
          request);
      });
  }

  //? Add the following method to the SpFxHttpClientDemoWebPart class to delete the last item in the list:
  private _deleteListItem(): Promise<SPHttpClientResponse> {
    //* get the last item
    return this.context.spHttpClient.get(
        this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Countries')/items?$select=Id,Title&$orderby=ID desc&$top=1`,
        SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.value[0];
      })
      .then((listItem: ICountryListItem) => {
        const request: any = {};
        request.headers = {
          'X-HTTP-METHOD': 'DELETE',
          'IF-MATCH': '*'
        };
        request.body = JSON.stringify(listItem);
        
        return this.context.spHttpClient.post(
          this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle/('Countries')/items(${listItem.Id})`,
          SPHttpClient.configurations.v1,
          request);
      });
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
