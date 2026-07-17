import { getAllEntries } from "../services/url.service.js";

export const getAllUrls = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { workspaceId, search } = req.query;

    let urls = await getAllEntries(userId, workspaceId);

    // Apply client-side filters like search
    if (search) {
      const q = search.toLowerCase();
      urls = urls.filter(
        (u) =>
          u.originalUrl.toLowerCase().includes(q) ||
          (u.customUrl && u.customUrl.toLowerCase().includes(q)) ||
          u.defaultId.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, data: urls });
  } catch (error) {
    console.error("Error fetching URLs: ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
