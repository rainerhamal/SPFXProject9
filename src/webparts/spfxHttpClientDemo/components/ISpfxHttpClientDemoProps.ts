//! Lsn 4.3.4 Update the public interface for the React component
import {
  ButtonClickedCallback,
  ICountryListItem
} from '../../../models';


export interface ISpfxHttpClientDemoProps {
  // description: string;
  //! Lsn 4.3.5 Update the interface to replace the existing description property to be a collection of items to be passed in and add an event when a button is selected:
  spListItems: ICountryListItem[];
  onGetListItems?: ButtonClickedCallback;
  
  //! Lsn 4.5.1 Add the add, update, and delete operations
  onAddListItem?: ButtonClickedCallback;
  onUpdateListItem?: ButtonClickedCallback;
  onDeleteListItem?: ButtonClickedCallback;

  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
