export default defineCachedEventHandler(
  async (event) => {
    const collectionId = getQuery(event).collection_id as string;

    if (!collectionId) {
      return null;
    }

    const response = await fetch(
      "https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          collectioncount: "1",
          "publishedfileids[0]": collectionId,
        }),
      },
    );
    const data = (await response.json()) as {
      response: {
        collectiondetails: Array<{
          children: Array<{
            publishedfileid: string;
          }>;
        }>;
      };
    };

    if (!data.response.collectiondetails) {
      return;
    }

    console.info(
      "data",
      data.response.collectiondetails
        .at(0)
        ?.children.map((child) => child.publishedfileid),
    );

    return data.response.collectiondetails
      .at(0)
      ?.children.map((child) => child.publishedfileid);
  },
  {
    maxAge: 60 * 5,
  },
);
