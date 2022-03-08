import { IAbstractScreen } from '../../../core/interfaces/abstract-screen.interface';
import { ITotal } from '../../../core/interfaces/total.interface';
import { IActionItem } from '../../../core/actions/action-item.interface';
import { Membership } from '../membership-display/memebership-display.interface';
import { Reward } from '../rewards-line-item/rewards-line-item.interface';

export interface SaleTotalPanelInterface extends IAbstractScreen {
    totals: ITotal[];
    grandTotal: ITotal;
    itemCounts: ITotal[];
    checkoutButton: IActionItem;
    helpButton: IActionItem;
    logoutButton: IActionItem;
    loyaltyButton: IActionItem;
    linkedCustomerButton: IActionItem;
    linkedEmployeeButton: IActionItem;
    promoButton: IActionItem;
    customer: { name: string, label: string, icon: string, id: string };
    employee: { name: string, label: string, icon: string, id: string };
    taxExemptCertificateDetail: { label: string, value: string };
    readOnly: boolean;
    prompt: string;
    statusMessage: string;
    profileIcon: string;
    loyaltyIDLabel: string;
    noMembershipsFoundLabel: string;
    membershipEnabled: boolean;
    memberships: Membership[];
    customerMissingInfoEnabled: boolean;
    customerMissingInfo: boolean;
    customerMissingInfoIcon: string;
    customerMissingInfoLabel: string;
    loyaltyOperationInProgressTitle: string;
    loyaltyOperationInProgressIcon: string;
    loyaltyOperationInProgressDetailsIcon: string;
    loyaltyCancelButton: IActionItem;
    membershipVisibleOnLinkButton: boolean;
    rewardsVisibleOnLinkButton: boolean;
    customerEmail: string;
    memberTierLabel: string;
    rewardsLabel: string;
    memberTier: string;
    loyaltyIcon: string;
    loyaltyRewards: Reward[];
    noPromotionsLabel: string;
}
