import { IAbstractScreen } from '../../core/interfaces/abstract-screen.interface';
import { IActionItem } from '../../core/actions/action-item.interface';
import { INotificationItem } from '../../core/interfaces/notification-item.interface';
import { StatusStripInterface } from '../../shared/screen-parts/status-strip/status-strip.interface';


export interface CrestHomeInterface extends IAbstractScreen {

    crestOnlineFlag: boolean;

    // menuItems: IActionItem[];
    backgroundImage: string;
    logo: string;
    offlineImageUrl: string;
    crestURL: string;
    // notificationItems: INotificationItem[];
    // statusStrip: StatusStripInterface;
}
