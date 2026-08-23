import React, { memo } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatIcon from "@mui/icons-material/Chat";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import GavelIcon from "@mui/icons-material/Gavel";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TokenIcon from "@mui/icons-material/Token";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";

const icons = {
  home: HomeIcon,
  people: PeopleIcon,
  access_time: AccessTimeIcon,
  attach_money: AttachMoneyIcon,
  security: SecurityIcon,
  person: PersonIcon,
  work: WorkIcon,
  chat: ChatIcon,
  assessment: AssessmentIcon,
  settings: SettingsIcon,
  account_tree: AccountTreeIcon,
  vertical_split: VerticalSplitIcon,
  gavel: GavelIcon,
  wallet: WalletIcon,
  edit_document: EditNoteIcon,
  token: TokenIcon,
  bookmark: BookmarkIcon,
  list_alt: ListAltIcon,
  event: EventIcon,
  campaign: CampaignIcon,
};

const IconMapper = memo(({ iconName, ...props }) => {
  const IconComponent = icons[iconName] || HomeIcon;
  return <IconComponent {...props} />;
});

IconMapper.displayName = "IconMapper";

export default IconMapper;
