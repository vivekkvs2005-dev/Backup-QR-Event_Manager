const {
  createEventService,
  getEventService,
  getOrganizerEventsService,
  completeEventService,
} = require("../services/eventService");

async function createEvent(
  req,
  res,
  next
) {

  try {

    const eventData = {
      ...req.body,

      organizer_id:
        req.user.id,
    };

    const eventId =
      await createEventService(
        eventData
      );

    res.json({
      message: "Event created!",
      id: eventId,
    });

  } catch (err) {
      next(err);
    }
}

async function getEvent(
  req,
  res,
  next
) {
  try {

    const event =
      await getEventService(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json(event);

  } catch (err) {
      next(err);
    }
}

async function getOrganizerEvents(
  req,
  res,
  next
) {
  try {

    const events =
      await getOrganizerEventsService(
        req.params.organizerId
      );

    res.json(events);

  } catch (err) {
      next(err);
    }
}

async function completeEvent(
  req,
  res,
  next
) {
  try {

    const totalEmails =
      await completeEventService(
        req.params.eventId
      );

    res.json({
      message:
        `Event completed and feedback emails sent to ${totalEmails} attendees!`,
    });

  } catch (err) {
      next(err);
    }
}

module.exports = {
  createEvent,
  getEvent,
  getOrganizerEvents,
  completeEvent,
};