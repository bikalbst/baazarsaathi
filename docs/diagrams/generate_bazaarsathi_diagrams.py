from pathlib import Path
import math
import textwrap

from PIL import Image, ImageDraw, ImageFont


OUT = Path(__file__).resolve().parent
FONT_REGULAR = Path(r"C:\Windows\Fonts\times.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\timesbd.ttf")

INK = "#172033"
NAVY = "#24486A"
BLUE = "#EAF2F8"
PALE = "#F5F7FA"
MID = "#758395"
LINE = "#43566B"
GREEN = "#E8F3EC"
RED = "#F8EAEA"
GOLD = "#F7F0DE"
WHITE = "#FFFFFF"


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def canvas(title, subtitle=None, size=(2200, 1400)):
    image = Image.new("RGB", size, WHITE)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, size[0], 104), fill=NAVY)
    draw.text((size[0] / 2, 51), title, fill=WHITE, font=font(38, True), anchor="mm")
    if subtitle:
        draw.text((size[0] / 2, 124), subtitle, fill=MID, font=font(23), anchor="ma")
    return image, draw


def wrapped(draw, box, text, size=24, bold=False, fill=INK, align="center", padding=20):
    x1, y1, x2, y2 = box
    usable = max(1, x2 - x1 - 2 * padding)
    avg = max(8, int(usable / (size * 0.54)))
    lines = []
    for paragraph in str(text).split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=avg, break_long_words=False) or [""])
    f = font(size, bold)
    spacing = max(5, int(size * 0.25))
    heights = [draw.textbbox((0, 0), line, font=f)[3] for line in lines]
    total = sum(heights) + spacing * (len(lines) - 1)
    y = y1 + (y2 - y1 - total) / 2
    for line, h in zip(lines, heights):
        if align == "left":
            draw.text((x1 + padding, y), line, font=f, fill=fill)
        else:
            draw.text(((x1 + x2) / 2, y), line, font=f, fill=fill, anchor="ma")
        y += h + spacing


def box(draw, xy, text, fill=BLUE, outline=LINE, radius=24, size=25, bold=False, width=4):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)
    wrapped(draw, xy, text, size=size, bold=bold)


def ellipse(draw, xy, text, fill=BLUE, outline=LINE, size=22, width=4):
    draw.ellipse(xy, fill=fill, outline=outline, width=width)
    wrapped(draw, xy, text, size=size, bold=True, padding=25)


def arrow(draw, start, end, fill=LINE, width=4, label=None, label_offset=(0, -18), dashed=False):
    if dashed:
        x1, y1 = start
        x2, y2 = end
        distance = math.hypot(x2 - x1, y2 - y1)
        if distance:
            steps = max(1, int(distance / 28))
            for i in range(0, steps, 2):
                a = i / steps
                b = min((i + 1) / steps, 1)
                draw.line((x1 + (x2 - x1) * a, y1 + (y2 - y1) * a,
                           x1 + (x2 - x1) * b, y1 + (y2 - y1) * b), fill=fill, width=width)
    else:
        draw.line((*start, *end), fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    length = 18
    spread = 0.5
    p1 = (end[0] - length * math.cos(angle - spread), end[1] - length * math.sin(angle - spread))
    p2 = (end[0] - length * math.cos(angle + spread), end[1] - length * math.sin(angle + spread))
    draw.polygon([end, p1, p2], fill=fill)
    if label:
        mx = (start[0] + end[0]) / 2 + label_offset[0]
        my = (start[1] + end[1]) / 2 + label_offset[1]
        bbox = draw.textbbox((mx, my), label, font=font(19), anchor="mm")
        draw.rectangle((bbox[0] - 6, bbox[1] - 3, bbox[2] + 6, bbox[3] + 3), fill=WHITE)
        draw.text((mx, my), label, fill=INK, font=font(19), anchor="mm")


def line(draw, start, end, fill=LINE, width=4, dashed=False):
    arrow(draw, start, end, fill=fill, width=width, dashed=dashed)


def actor(draw, center, label):
    x, y = center
    draw.ellipse((x - 28, y - 100, x + 28, y - 44), outline=INK, width=5)
    draw.line((x, y - 44, x, y + 42), fill=INK, width=5)
    draw.line((x - 48, y - 10, x + 48, y - 10), fill=INK, width=5)
    draw.line((x, y + 42, x - 42, y + 105), fill=INK, width=5)
    draw.line((x, y + 42, x + 42, y + 105), fill=INK, width=5)
    draw.text((x, y + 132), label, fill=INK, font=font(25, True), anchor="mm")


def save(image, name):
    path = OUT / name
    image.save(path, "PNG", dpi=(300, 300), optimize=True)
    return path


def use_case_diagram():
    image, draw = canvas("BazaarSathi Use Case Diagram", "Implemented actors and marketplace capabilities", (2400, 1600))
    boundary = (390, 180, 2010, 1500)
    draw.rounded_rectangle(boundary, radius=28, fill="#FBFCFD", outline=NAVY, width=6)
    draw.text((420, 205), "BazaarSathi Marketplace", font=font(28, True), fill=NAVY)
    actor(draw, (190, 480), "Buyer")
    actor(draw, (190, 1120), "Seller")
    actor(draw, (2210, 470), "Administrator")
    actor(draw, (2210, 1140), "Khalti Gateway")
    cases = {
        "auth": (500, 280, 950, 410, "Register / Log in"),
        "browse": (1010, 280, 1500, 410, "Browse, search and filter listings"),
        "activity": (1540, 280, 1930, 410, "Manage favourites and recent views"),
        "chat": (500, 540, 950, 680, "Chat about a listing"),
        "buy": (1010, 540, 1500, 680, "Create order and pay"),
        "review": (1540, 540, 1930, 680, "Submit verified review"),
        "listing": (500, 820, 950, 960, "Create and manage own listings"),
        "predict": (1010, 820, 1500, 960, "Request ML price estimate"),
        "orders": (1540, 820, 1930, 960, "View purchases and sales"),
        "approve": (500, 1100, 950, 1240, "Approve paid escrow"),
        "setting": (1010, 1100, 1500, 1240, "Toggle automatic approval"),
        "monitor": (1540, 1100, 1930, 1240, "Monitor users, listings and orders"),
        "verify": (780, 1320, 1290, 1450, "Verify payment and hold escrow"),
        "release": (1370, 1320, 1880, 1450, "Release 90% seller earning"),
    }
    for x1, y1, x2, y2, label in cases.values():
        ellipse(draw, (x1, y1, x2, y2), label, size=21)
    # Actor associations.
    for target in ["auth", "browse", "activity", "chat", "buy", "review", "orders"]:
        x1, y1, _, y2, _ = cases[target]
        draw.line((245, 480, x1, (y1 + y2) / 2), fill=MID, width=3)
    for target in ["auth", "listing", "predict", "chat", "orders"]:
        x1, y1, _, y2, _ = cases[target]
        draw.line((245, 1120, x1, (y1 + y2) / 2), fill=MID, width=3)
    for target in ["approve", "setting", "monitor"]:
        _, y1, x2, y2, _ = cases[target]
        draw.line((2155, 470, x2, (y1 + y2) / 2), fill=MID, width=3)
    for target in ["buy", "verify"]:
        _, y1, x2, y2, _ = cases[target]
        draw.line((2155, 1140, x2, (y1 + y2) / 2), fill=MID, width=3)
    arrow(draw, (1255, 680), (1035, 1320), label="<<include>>", label_offset=(25, -10), dashed=True)
    arrow(draw, (1290, 1385), (1370, 1385), label="after approval", label_offset=(0, -24), dashed=True)
    return save(image, "01-use-case-diagram.png")


def class_box(draw, xy, name, attributes, fill=PALE):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=16, fill=fill, outline=NAVY, width=4)
    header_h = 55
    draw.rectangle((x1, y1, x2, y1 + header_h), fill=NAVY)
    draw.text(((x1 + x2) / 2, y1 + header_h / 2), name, fill=WHITE, font=font(24, True), anchor="mm")
    y = y1 + header_h + 16
    for attribute in attributes:
        draw.text((x1 + 18, y), attribute, fill=INK, font=font(18))
        y += 29


def relation(draw, start, end, left_label="", right_label="", relation_label=""):
    draw.line((*start, *end), fill=LINE, width=3)
    if left_label:
        draw.text((start[0] + 8, start[1] - 24), left_label, font=font(18, True), fill=INK)
    if right_label:
        draw.text((end[0] - 8, end[1] - 24), right_label, font=font(18, True), fill=INK, anchor="ra")
    if relation_label:
        mx, my = (start[0] + end[0]) / 2, (start[1] + end[1]) / 2 - 18
        draw.text((mx, my), relation_label, font=font(16), fill=MID, anchor="mm")


def class_diagram():
    image, draw = canvas("BazaarSathi Class Diagram", "Core Mongoose domain models and cardinalities", (2500, 1750))
    boxes = {
        "User": (80, 190, 650, 520),
        "Listing": (965, 190, 1535, 520),
        "AdminSetting": (1850, 190, 2420, 430),
        "Favorite": (80, 690, 650, 960),
        "RecentlyViewed": (965, 690, 1535, 990),
        "Review": (1850, 650, 2420, 1010),
        "Conversation": (80, 1210, 650, 1510),
        "Message": (965, 1210, 1535, 1510),
        "Order": (1850, 1160, 2420, 1660),
    }
    class_box(draw, boxes["User"], "User", ["_id: ObjectId", "name: String", "email: String (unique)", "password: bcrypt hash", "role: buyer | seller | admin", "walletBalance: Number", "reputation: embedded object", "createdAt: Date"], BLUE)
    class_box(draw, boxes["Listing"], "Listing", ["_id: ObjectId", "title, description: String", "price: Number", "category, condition: String", "images: [String]", "seller: User ref", "status: active | sold | inactive", "views, createdAt"], BLUE)
    class_box(draw, boxes["AdminSetting"], "AdminSetting", ["_id: ObjectId", "key: 'escrow' (unique)", "autoAccept: Boolean"], GOLD)
    class_box(draw, boxes["Favorite"], "Favorite", ["_id: ObjectId", "user: User ref", "listing: Listing ref", "createdAt: Date", "unique(user, listing)"], PALE)
    class_box(draw, boxes["RecentlyViewed"], "RecentlyViewed", ["_id: ObjectId", "user: User ref", "listing: Listing ref", "viewCount: Number", "lastViewedAt: Date", "unique(user, listing)"], PALE)
    class_box(draw, boxes["Review"], "Review", ["_id: ObjectId", "order: Order ref (unique)", "reviewer: User ref", "seller: User ref", "listing: Listing ref", "rating: 1..5", "comment, createdAt"], GREEN)
    class_box(draw, boxes["Conversation"], "Conversation", ["_id: ObjectId", "participants: [User ref] {2}", "listingRef: Listing ref", "conversationKey: String", "createdAt, updatedAt"], PALE)
    class_box(draw, boxes["Message"], "Message", ["_id: ObjectId", "conversationId: ref", "sender: User ref", "content: String", "read: Boolean", "createdAt: Date"], PALE)
    class_box(draw, boxes["Order"], "Order", ["_id: ObjectId", "buyer, seller: User ref", "listing: Listing ref", "amount, commission (10%)", "sellerEarning (90%)", "paymentMethod, paymentId", "paymentVerified, paymentStatus", "status: pending | completed | cancelled", "paidAt, releasedAt, createdAt"], GREEN)
    relation(draw, (650, 330), (965, 330), "1", "0..*", "sells")
    relation(draw, (365, 520), (365, 690), "1", "0..*", "saves")
    relation(draw, (1250, 520), (1250, 690), "1", "0..*", "is viewed")
    relation(draw, (650, 1360), (965, 1360), "1", "0..*", "contains")
    relation(draw, (70, 400), (70, 1360), "1", "0..*", "")
    draw.line((70, 400, 80, 400), fill=LINE, width=3)
    draw.line((70, 1360, 80, 1360), fill=LINE, width=3)
    draw.text((88, 850), "participates in", font=font(16), fill=MID)
    relation(draw, (2135, 1010), (2135, 1160), "0..1", "1", "reviews")
    relation(draw, (1535, 390), (2010, 1160), "1", "0..*", "purchased in")
    relation(draw, (650, 420), (1850, 1370), "1", "0..*", "buys/sells")
    relation(draw, (650, 700), (965, 500), "0..*", "1", "targets")
    return save(image, "02-class-diagram.png")


def object_box(draw, xy, title, values, fill=PALE):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=18, fill=fill, outline=NAVY, width=4)
    draw.text(((x1 + x2) / 2, y1 + 35), title, font=font(23, True), fill=NAVY, anchor="mm")
    draw.line((x1 + 15, y1 + 66, x2 - 15, y1 + 66), fill=NAVY, width=2)
    y = y1 + 85
    for value in values:
        draw.text((x1 + 18, y), value, font=font(18), fill=INK)
        y += 30


def object_diagram():
    image, draw = canvas("BazaarSathi Object Diagram", "Example runtime objects for one completed marketplace transaction", (2300, 1450))
    objects = {
        "buyer": (70, 210, 560, 460),
        "seller": (70, 880, 560, 1130),
        "listing": (730, 180, 1450, 500),
        "order": (730, 700, 1450, 1110),
        "conversation": (1630, 180, 2220, 450),
        "message": (1630, 570, 2220, 830),
        "review": (1630, 980, 2220, 1270),
    }
    object_box(draw, objects["buyer"], "buyer01 : User", ["name = 'Bimal Shrestha'", "role = 'buyer'", "walletBalance = 0"], BLUE)
    object_box(draw, objects["seller"], "seller07 : User", ["name = 'Sita Rai'", "role = 'seller'", "reputation.tier = 'trusted'"], BLUE)
    object_box(draw, objects["listing"], "listing42 : Listing", ["title = 'MacBook Pro 14'", "price = NPR 120,000", "condition = 'like-new'", "status = 'sold'", "seller = seller07"], GOLD)
    object_box(draw, objects["order"], "order88 : Order", ["buyer = buyer01", "seller = seller07", "listing = listing42", "amount = NPR 120,000", "commission = NPR 12,000", "sellerEarning = NPR 108,000", "paymentVerified = true", "status = 'completed'"], GREEN)
    object_box(draw, objects["conversation"], "conversation15 : Conversation", ["participants = [buyer01, seller07]", "listingRef = listing42", "conversationKey = listing:buyer:seller"], PALE)
    object_box(draw, objects["message"], "message31 : Message", ["conversationId = conversation15", "sender = buyer01", "content = 'Is this available?'", "read = true"], PALE)
    object_box(draw, objects["review"], "review09 : Review", ["order = order88", "reviewer = buyer01", "seller = seller07", "rating = 5", "comment = 'As described'"], GREEN)
    relation(draw, (560, 330), (730, 330), relation_label="views/buys")
    relation(draw, (560, 1000), (920, 1110), relation_label="owns")
    relation(draw, (1090, 500), (1090, 700), relation_label="purchased as")
    relation(draw, (1450, 330), (1630, 315), relation_label="discussed in")
    relation(draw, (1925, 450), (1925, 570), relation_label="contains")
    relation(draw, (1450, 905), (1630, 1110), relation_label="verified by")
    return save(image, "03-object-diagram.png")


def state_diagram():
    image, draw = canvas("Order and Escrow State Diagram", "State transitions enforced by OrderController and EscrowService", (2200, 1350))
    draw.ellipse((130, 590, 190, 650), fill=INK)
    box(draw, (310, 500, 760, 750), "PENDING\npaymentStatus = initiated\npaymentVerified = false", fill=GOLD, size=26, bold=True)
    box(draw, (940, 500, 1390, 750), "PAID / ESCROW HELD\npaymentStatus = paid\npaymentVerified = true\nlisting.status = sold", fill=BLUE, size=25, bold=True)
    box(draw, (1580, 270, 2050, 540), "COMPLETED\nstatus = completed\n90% credited to seller wallet\nreleasedAt recorded", fill=GREEN, size=24, bold=True)
    box(draw, (1580, 850, 2050, 1090), "CANCELLED\nstatus = cancelled\npaymentStatus = failed/refunded", fill=RED, size=24, bold=True)
    arrow(draw, (190, 620), (310, 620), label="create order", label_offset=(0, -25))
    arrow(draw, (760, 620), (940, 620), label="Khalti lookup = Completed", label_offset=(0, -28))
    arrow(draw, (1390, 590), (1580, 430), label="admin approves OR autoAccept = true", label_offset=(0, -28))
    arrow(draw, (760, 700), (1580, 960), label="terminal payment failure", label_offset=(20, 22))
    arrow(draw, (1390, 690), (1580, 930), label="cancellation / refund", label_offset=(15, 20))
    arrow(draw, (1815, 270), (1815, 200), label="repeat approval: no duplicate credit", label_offset=(0, -20))
    draw.arc((1640, 125, 1990, 330), 190, 355, fill=LINE, width=4)
    arrow(draw, (1990, 245), (1985, 300), width=4)
    draw.text((1100, 1180), "Invariant: escrow is released only after verified payment; MongoDB transactions keep order, listing and wallet changes consistent.", font=font(24), fill=NAVY, anchor="mm")
    return save(image, "04-order-state-diagram.png")


def sequence_diagram():
    image, draw = canvas("Payment Verification and Escrow Sequence Diagram", "Khalti payment with optional automatic approval", (2500, 2200))
    names = ["Buyer", "React Client", "OrderController", "Khalti API", "EscrowService", "MongoDB", "Administrator"]
    xs = [130, 470, 850, 1230, 1600, 1950, 2330]
    for x, name in zip(xs, names):
        box(draw, (x - 130, 160, x + 130, 245), name, fill=BLUE, size=20, bold=True, radius=12)
        y = 245
        while y < 2110:
            draw.line((x, y, x, min(y + 18, 2110)), fill=MID, width=2)
            y += 34
    y = 310
    steps = [
        (0, 1, "1. Select listing and payment method"),
        (1, 2, "2. POST /api/orders/create"),
        (2, 5, "3. Validate listing; save pending order"),
        (2, 3, "4. POST /epayment/initiate"),
        (3, 2, "5. pidx + payment_url"),
        (2, 1, "6. Return order and checkout URL"),
        (1, 3, "7. Redirect buyer to Khalti checkout"),
        (3, 1, "8. Return to /payment/callback?pidx=..."),
        (1, 2, "9. POST /api/orders/khalti-verify"),
        (2, 3, "10. POST /epayment/lookup"),
        (3, 2, "11. Completed + amount + transaction_id"),
        (2, 4, "12. confirmPayment(orderId)"),
        (4, 5, "13. Transaction: mark paid and listing sold"),
        (2, 5, "14. Read AdminSetting.autoAccept"),
    ]
    for source, target, label in steps:
        arrow(draw, (xs[source], y), (xs[target], y), width=3, label=label, label_offset=(0, -17), dashed=source > target)
        y += 83
    # Alternative fragment.
    draw.rounded_rectangle((760, y - 20, 2420, 2130), radius=16, outline=NAVY, width=4)
    draw.text((785, y), "alt", font=font(22, True), fill=NAVY)
    y += 60
    arrow(draw, (xs[2], y), (xs[4], y), width=3, label="15a. autoAccept=true: releaseEscrow", label_offset=(0, -17))
    y += 82
    arrow(draw, (xs[4], y), (xs[5], y), width=3, label="credit seller 90%; set completed", label_offset=(0, -17))
    y += 100
    draw.line((780, y, 2400, y), fill=MID, width=2)
    draw.text((800, y + 18), "else autoAccept=false", font=font(20, True), fill=INK)
    y += 92
    arrow(draw, (xs[6], y), (xs[2], y), width=3, label="15b. PUT /api/orders/:id/approve", label_offset=(0, -17))
    y += 82
    arrow(draw, (xs[2], y), (xs[4], y), width=3, label="releaseEscrow(orderId)", label_offset=(0, -17))
    y += 82
    arrow(draw, (xs[4], y), (xs[5], y), width=3, label="credit seller 90%; set completed", label_offset=(0, -17))
    return save(image, "05-payment-escrow-sequence-diagram.png")


def activity_diagram():
    image, draw = canvas("Buyer Purchase Activity Diagram", "End-to-end marketplace purchase and escrow workflow", (2200, 1650))
    center = 1100
    draw.ellipse((center - 28, 150, center + 28, 206), fill=INK)
    nodes = [
        (center - 300, 245, center + 300, 340, "Browse/search listings", BLUE),
        (center - 300, 390, center + 300, 485, "Open listing details", BLUE),
        (center - 300, 535, center + 300, 630, "Authenticate and create order", BLUE),
        (center - 300, 680, center + 300, 775, "Complete Khalti wallet/card checkout", GOLD),
        (center - 300, 825, center + 300, 920, "Verify pidx, status and amount", GOLD),
    ]
    last = (center, 206)
    for x1, y1, x2, y2, text, fill in nodes:
        box(draw, (x1, y1, x2, y2), text, fill=fill, size=24, bold=True, radius=18)
        arrow(draw, last, (center, y1), width=4)
        last = (center, y2)
    # Payment verified decision.
    diamond = [(center, 980), (center + 170, 1070), (center, 1160), (center - 170, 1070)]
    draw.polygon(diamond, fill=PALE, outline=NAVY)
    wrapped(draw, (center - 140, 1005, center + 140, 1135), "Payment completed?", size=23, bold=True)
    arrow(draw, last, (center, 980), width=4)
    box(draw, (160, 1015, 700, 1125), "Cancel or retain pending order\n(no escrow release)", fill=RED, size=22, bold=True)
    arrow(draw, (center - 170, 1070), (700, 1070), label="No", label_offset=(0, -18))
    draw.ellipse((395, 1215, 465, 1285), outline=INK, width=5)
    draw.ellipse((407, 1227, 453, 1273), fill=INK)
    arrow(draw, (430, 1125), (430, 1215), width=4)
    # Auto accept decision.
    diamond2 = [(center, 1210), (center + 170, 1300), (center, 1390), (center - 170, 1300)]
    draw.polygon(diamond2, fill=PALE, outline=NAVY)
    wrapped(draw, (center - 140, 1235, center + 140, 1365), "autoAccept enabled?", size=22, bold=True)
    arrow(draw, (center, 1160), (center, 1210), label="Yes: hold escrow", label_offset=(100, -12))
    box(draw, (1500, 1040, 2070, 1140), "Administrator reviews paid order", fill=BLUE, size=22, bold=True)
    box(draw, (1500, 1230, 2070, 1330), "Approve order", fill=BLUE, size=22, bold=True)
    arrow(draw, (center + 170, 1300), (1500, 1090), label="No", label_offset=(0, -18))
    arrow(draw, (1785, 1140), (1785, 1230), width=4)
    box(draw, (800, 1460, 1400, 1555), "Release escrow: credit seller 90%\nand complete order", fill=GREEN, size=23, bold=True)
    arrow(draw, (center, 1390), (center, 1460), label="Yes", label_offset=(45, -12))
    arrow(draw, (1785, 1330), (1400, 1505), label="approved", label_offset=(0, -18))
    draw.ellipse((center - 35, 1580, center + 35, 1650), outline=INK, width=5)
    draw.ellipse((center - 23, 1592, center + 23, 1638), fill=INK)
    arrow(draw, (center, 1555), (center, 1580), width=4)
    return save(image, "06-purchase-activity-diagram.png")


def component_diagram():
    image, draw = canvas("BazaarSathi Component Diagram", "Logical components and interfaces in the implemented system", (2400, 1550))
    box(draw, (70, 210, 600, 1340), "React Web Client", fill=BLUE, size=30, bold=True)
    client_items = ["Pages and routing", "AuthContext + JWT", "API service", "ChatContext / Socket.IO client", "Buyer, seller and admin dashboards"]
    y = 370
    for item in client_items:
        box(draw, (130, y, 540, y + 115), item, fill=WHITE, size=21, radius=14)
        y += 155
    box(draw, (760, 170, 1690, 1380), "Node.js Application Server", fill=PALE, size=30, bold=True)
    server_items = [
        ((820, 330, 1215, 470), "Express Routes\n/api/auth, listings, orders, chat, activity, reviews, price"),
        ((1250, 330, 1630, 470), "JWT Middleware\nprotect + role checks"),
        ((820, 560, 1215, 700), "MVC Controllers\nvalidation + orchestration"),
        ((1250, 560, 1630, 700), "Socket.IO Gateway\nrooms + real-time events"),
        ((820, 790, 1215, 930), "Domain Services\nescrow, activity, reputation"),
        ((1250, 790, 1630, 930), "Khalti Service\ninitiate + lookup"),
        ((820, 1020, 1215, 1160), "Price Prediction Service Client"),
        ((1250, 1020, 1630, 1160), "Mongoose Models\n9 persistent schemas"),
    ]
    for xy, label in server_items:
        box(draw, xy, label, fill=WHITE, size=20, bold=True, radius=14)
    box(draw, (1840, 190, 2325, 470), "MongoDB", fill=GREEN, size=28, bold=True)
    box(draw, (1840, 610, 2325, 890), "Khalti ePayment API", fill=GOLD, size=26, bold=True)
    box(draw, (1840, 1030, 2325, 1310), "FastAPI ML Service\nTF-IDF + Random Forest", fill=BLUE, size=25, bold=True)
    arrow(draw, (600, 520), (760, 520), label="HTTPS / JSON", label_offset=(0, -20))
    arrow(draw, (600, 920), (760, 920), label="WebSocket", label_offset=(0, -20))
    arrow(draw, (1630, 1090), (1840, 1170), label="HTTP /predict", label_offset=(0, -20))
    arrow(draw, (1630, 1090), (1840, 330), label="Mongoose", label_offset=(0, -20))
    arrow(draw, (1630, 860), (1840, 750), label="HTTPS", label_offset=(0, -20))
    arrow(draw, (1215, 630), (1250, 630), width=3)
    arrow(draw, (1215, 860), (1250, 860), width=3)
    return save(image, "07-component-diagram.png")


def deployment_diagram():
    image, draw = canvas("BazaarSathi Deployment Diagram", "Recommended runtime topology for the implemented application", (2400, 1500))
    box(draw, (80, 300, 550, 760), "User Device\n\nWeb Browser\nReact SPA\nSocket.IO Client", fill=BLUE, size=28, bold=True)
    box(draw, (760, 180, 1580, 880), "Application Host\n\nNode.js Process :5000\nExpress REST API\nSocket.IO Server\nJWT Middleware\nMVC Controllers\nDomain Services", fill=PALE, size=27, bold=True)
    box(draw, (760, 1030, 1580, 1370), "ML Service Host\n\nPython / FastAPI :8000\nTF-IDF feature pipeline\nRandomForestRegressor artifact", fill=BLUE, size=25, bold=True)
    box(draw, (1840, 160, 2320, 500), "Database Host\n\nMongoDB\nUsers, listings, orders,\nchat, activity, reviews", fill=GREEN, size=25, bold=True)
    box(draw, (1840, 650, 2320, 940), "External Service\n\nKhalti ePayment API\ninitiate + lookup", fill=GOLD, size=25, bold=True)
    box(draw, (1840, 1100, 2320, 1370), "Configuration\n\n.env secrets\nJWT, Mongo, Khalti,\nfrontend and ML URLs", fill=PALE, size=24, bold=True)
    arrow(draw, (550, 440), (760, 440), label="HTTPS : REST/JSON", label_offset=(0, -24))
    arrow(draw, (550, 650), (760, 650), label="WSS : Socket.IO", label_offset=(0, -24))
    arrow(draw, (1580, 360), (1840, 330), label="TLS / MongoDB protocol", label_offset=(0, -24))
    arrow(draw, (1580, 700), (1840, 790), label="HTTPS", label_offset=(0, -24))
    arrow(draw, (1170, 880), (1170, 1030), label="HTTP /predict", label_offset=(120, -2))
    arrow(draw, (2080, 1100), (1500, 830), label="injected at startup", label_offset=(0, -24), dashed=True)
    draw.text((1200, 1430), "Local development may place the React, Node.js and FastAPI processes on one workstation; production should use HTTPS, restricted database access and managed secrets.", font=font(22), fill=NAVY, anchor="mm")
    return save(image, "08-deployment-diagram.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [
        use_case_diagram(),
        class_diagram(),
        object_diagram(),
        state_diagram(),
        sequence_diagram(),
        activity_diagram(),
        component_diagram(),
        deployment_diagram(),
    ]
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
