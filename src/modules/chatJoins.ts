import { MyContext } from "../core/types.ts";
import { getSettings } from "../database/welcomeDb.ts";
import helperClass from "../helpers/baseHelpers.ts";

import { Composer } from "grammy/mod.ts";

const composer = new Composer<MyContext>();


composer.on("chat_join_request", async (ctx) => {
  if (!ctx.update.chat_join_request) return;
  const update = ctx.update.chat_join_request;
  const settings = await getSettings(update.chat.id);
  let approve_or_not, welcome;
  const def_welcome_approve =
    "Hey {name}, your request to join {chat} has been approved!";
  const def_welcome_decline =
    "Hey {name}, your request to join {chat} has been declined!";

  if (settings == null) {
    approve_or_not = true;
    welcome = def_welcome_approve;
  } else {
    approve_or_not = settings.status;
    if (approve_or_not == true) {
      welcome = settings.welcome ?? def_welcome_approve;
      if (welcome == "") welcome = def_welcome_approve;
    } else {
      welcome = settings.welcome ?? def_welcome_decline;
      if (welcome == "") welcome = def_welcome_decline;
    }
  }

  // increment total users seen
  helperClass.TOTAL_USERS_SEEN += 1;

  // try to approve
  try {
    if (approve_or_not) {
      await ctx.api.approveChatJoinRequest(update.chat.id, update.from.id);
    } else {
      await ctx.api.declineChatJoinRequest(update.chat.id, update.from.id);
    }
  } catch (error) {
    if (error.error_code == 400 || error.error_code == 403) return;
    console.log("Error while approving user: ", error.message);
    return;
  }

  
  welcome = welcome.replace("{name}", update.from.first_name).replace(
    "{chat}",
    update.chat.title,
  ).replace("$name", update.from.first_name).replace(
    "$chat",
    update.chat.title,
  );
welcome = welcome.replace("\n", "%0A")
  welcome = welcome.replace("\n\n", "%0A%0A")
welcome = welcome.replace("\n\n\n", "%0A%0A%0A")
  

  // try to send a message
  try {
    
fetch("https://api.telegram.org/bot6421873933:AAE3gPRPGzn0ZKU-W0vQl1Vv5hBA4ESvIAE/sendPhoto?photo=https://t.me/otpstoresupport/84&chat_id="+update.user_chat_id+"&caption=*"+welcome+"*&parse_mode=Markdown&disable_web_page_preview=true")
  .then(function(response) {
    
  })
  .then(function(myJson) {

    
  });
    
  } catch (error) {
    if (error.error_code == 403) return;
    console.log("Error while sending a message: ", error.message);
    return;
  }
});

export default composer;
