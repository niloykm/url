import { model, Schema } from "mongoose";

const analyticsSchema = new Schema(
  {
    urlId: {
      type: Schema.Types.ObjectId,
      ref: "URL",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ip: String,
    country: {
      type: String,
      default: "Unknown",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    referrer: {
      type: String,
      default: "Direct",
    },
    // UTM parameters
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String,
  },
  { timestamps: true }
);

const Analytics = model("Analytics", analyticsSchema);
export default Analytics;
