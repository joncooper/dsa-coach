def sessionize_events(events: list[list[object]], timeout: int) -> list[list[object]]:
    open_sessions = {}
    closed = []
    for timestamp, user_id in events:
        session = open_sessions.get(user_id)
        if session is None or timestamp - session['end'] > timeout:
            if session is not None:
                closed.append([user_id, session['start'], session['end'], session['count']])
            open_sessions[user_id] = {'start': timestamp, 'end': timestamp, 'count': 1}
        else:
            session['end'] = timestamp
            session['count'] += 1
    for user_id, session in open_sessions.items():
        closed.append([user_id, session['start'], session['end'], session['count']])
    closed.sort(key=lambda row: (row[1], row[0]))
    return closed
