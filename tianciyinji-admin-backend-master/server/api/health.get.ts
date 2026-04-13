export default defineEventHandler(() => {
  return {
    statusCode: 200,
    message: "ok",
    data: {
      healthy: true,
    },
  };
});

