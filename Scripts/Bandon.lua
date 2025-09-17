local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer
local Workspace = game:GetService("Workspace")

-- ========== 📢 Notification UI ==========
local function createNotificationUI()
    local gui = Instance.new("ScreenGui")
    gui.Name = "NotificationGui"
    gui.ResetOnSpawn = false
    gui.Parent = LocalPlayer:WaitForChild("PlayerGui")

    local frame = Instance.new("Frame")
    frame.Name = "List"
    frame.Size = UDim2.new(0, 300, 1, 0)
    frame.Position = UDim2.new(1, -310, 0, 100)
    frame.BackgroundTransparency = 1
    frame.AutomaticSize = Enum.AutomaticSize.Y
    frame.ClipsDescendants = false
    frame.Parent = gui

    local layout = Instance.new("UIListLayout")
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 5)
    layout.Parent = frame

    return frame
end

local NotificationFrame = createNotificationUI()
local notifyCooldowns = {}

local function canNotify(id, cooldown)
    local last = notifyCooldowns[id]
    if not last or tick() - last >= cooldown then
        notifyCooldowns[id] = tick()
        return true
    end
    return false
end

local function notify(message, type)
    local colors = {
        default = Color3.fromRGB(255, 255, 255),
        success = Color3.fromRGB(0, 255, 0),
        warning = Color3.fromRGB(255, 255, 0),
        danger = Color3.fromRGB(255, 0, 0),
    }

    local textLabel = Instance.new("TextLabel")
    textLabel.Size = UDim2.new(1, 0, 0, 30)
    textLabel.BackgroundTransparency = 0.3
    textLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    textLabel.TextColor3 = colors[type] or colors.default
    textLabel.Text = message
    textLabel.Font = Enum.Font.SourceSansBold
    textLabel.TextSize = 18
    textLabel.Parent = NotificationFrame

    delay(5, function()
        if textLabel then textLabel:Destroy() end
    end)
end

-- ========== 🏠 Find Base Model ==========
local function findBaseModel()
    local plotsFolder = Workspace:WaitForChild("Plots")
    local targetText = LocalPlayer.Name .. "'s Base"

    for _, descendant in ipairs(plotsFolder:GetDescendants()) do
        if descendant:IsA("TextLabel") and descendant.Text == targetText then
            local current = descendant
            while current and current.Parent ~= plotsFolder do
                current = current.Parent
            end
            local baseModel = current
            if baseModel and baseModel:IsA("Model") and baseModel.Parent == plotsFolder then
                notify("✅ Found your base!", "success")
                local purchases = baseModel:FindFirstChild("Purchases")
                local plotBlock = purchases and purchases:FindFirstChild("PlotBlock")
                local countdownLabel = nil

                if plotBlock then
                    local main = plotBlock:FindFirstChild("Main") or plotBlock
                    if main then
                        local gui = main:FindFirstChildOfClass("BillboardGui")
                        if gui then
                            countdownLabel = gui:FindFirstChild("RemainingTime")
                        end
                    end
                end

                return baseModel, plotBlock, countdownLabel
            end
        end
    end

    notify("❌ Could not find your base!", "danger")
    return nil, nil, nil
end

local BaseModel, PlotModel, CountdownLabel = findBaseModel()
if not BaseModel then return end

-- ========== ⏳ Countdown Display GUI ==========
local function createCountdownDisplay()
    local gui = Instance.new("ScreenGui")
    gui.Name = "CountdownDisplayGui"
    gui.ResetOnSpawn = false
    gui.Parent = LocalPlayer:WaitForChild("PlayerGui")

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0, 200, 0, 30)
    label.Position = UDim2.new(0, 10, 1, -40)
    label.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    label.BackgroundTransparency = 0.4
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.Font = Enum.Font.SourceSansBold
    label.TextSize = 18
    label.Text = "Base Timer: N/A"
    label.Name = "CountdownLabel"
    label.Parent = gui

    return label
end

local CountdownDisplayLabel = createCountdownDisplay()
local lastCountdownText = ""

-- ========== ✅ Update Countdown GUI + Notify on Unlock ==========
task.spawn(function()
    while true do
        if not CountdownLabel or not CountdownLabel:IsDescendantOf(game) then
            BaseModel, PlotModel, CountdownLabel = findBaseModel()
            lastCountdownText = ""
        end

        local currentText = CountdownLabel and CountdownLabel:IsA("TextLabel") and CountdownLabel.Text or ""

        if currentText ~= "" then
            CountdownDisplayLabel.Text = "Base Timer: " .. currentText

            -- Notify only once when the text changes to "1s"
            if currentText == "1s" and lastCountdownText ~= "1s" then
                notify("🔓 Your base is unlocked! Go lock it!", "danger")
            end

            -- Update the last seen text
            lastCountdownText = currentText
        else
            CountdownDisplayLabel.Text = "Base Timer: N/A"
            lastCountdownText = ""
        end

        task.wait(1)
    end
end)

-- ========== 🎯 Highlight Utility ==========
local function addHighlight(char, name, color)
    if not char or not char:IsDescendantOf(Workspace) then return end
    if char:FindFirstChild(name) then return end

    local highlight = Instance.new("Highlight")
    highlight.Name = name
    highlight.FillColor = color
    highlight.OutlineColor = Color3.new(0, 0, 0)
    highlight.OutlineTransparency = 0
    highlight.Parent = char
end

local function removeHighlight(char, name)
    local h = char and char:FindFirstChild(name)
    if h then h:Destroy() end
end

-- ========== 🧠 Billboard GUI Helpers ==========
local function addBillboard(player, text, color, name)
    local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
    if not root then return end

    local billboard = root:FindFirstChild("StackedBillboard")
    if not billboard then
        billboard = Instance.new("BillboardGui")
        billboard.Name = "StackedBillboard"
        billboard.Size = UDim2.new(0, 150, 0, 100)
        billboard.StudsOffset = Vector3.new(0, 4, 0)
        billboard.AlwaysOnTop = true
        billboard.Adornee = root
        billboard.Parent = root

        local layout = Instance.new("UIListLayout")
        layout.SortOrder = Enum.SortOrder.LayoutOrder
        layout.Padding = UDim.new(0, 2)
        layout.Parent = billboard
    end

    if billboard:FindFirstChild(name) then return end

    local label = Instance.new("TextLabel")
    label.Name = name
    label.Size = UDim2.new(1, 0, 0, 20)
    label.BackgroundTransparency = 1
    label.Text = text
    label.TextColor3 = color
    label.TextScaled = true
    label.Font = Enum.Font.SourceSansBold
    label.Parent = billboard
end

local function removeBillboard(player, name)
    local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
    if not root then return end

    local billboard = root:FindFirstChild("StackedBillboard")
    if billboard then
        local label = billboard:FindFirstChild(name)
        if label then
            label:Destroy()
        end
        if #billboard:GetChildren() <= 1 then
            billboard:Destroy()
        end
    end
end

-- ========== 🧍 Proximity Detection ==========
local ProximityRange = 50
local DangerRange = 50 -- doubled the original 25

RunService.Heartbeat:Connect(function()
    if not CountdownLabel or not CountdownLabel:IsDescendantOf(game) then
        BaseModel, PlotModel, CountdownLabel = findBaseModel()
        if not BaseModel then return end
    end

    local hitbox = PlotModel and PlotModel:FindFirstChild("Hitbox")
    local basePos = hitbox and hitbox.Position or Vector3.new(0, 0, 0)

    local countdownPos = Vector3.new(math.huge, math.huge, math.huge)
    if CountdownLabel and CountdownLabel.Parent and CountdownLabel.Parent:IsA("BillboardGui") then
        countdownPos = CountdownLabel.Parent.Adornee and CountdownLabel.Parent.Adornee.Position or countdownPos
    end

    for _, player in ipairs(Players:GetPlayers()) do
        if player == LocalPlayer then continue end

        local char = player.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        if not hrp then continue end

        local distToBase = (hrp.Position - basePos).Magnitude
        local distToCountdown = (hrp.Position - countdownPos).Magnitude

        if distToBase < ProximityRange then
            if canNotify(player.Name .. "_near", 5) then
                notify("⚠️ " .. player.Name .. " is near your base!", "warning")
            end
            addBillboard(player, "NEAR BASE", Color3.fromRGB(255, 255, 0), "NearBase")
            addHighlight(char, "NearBaseHighlight", Color3.fromRGB(255, 255, 0))
        else
            removeBillboard(player, "NearBase")
            removeHighlight(char, "NearBaseHighlight")
        end

        if distToCountdown < DangerRange then
            if canNotify(player.Name .. "_danger", 5) then
                notify("🚨 " .. player.Name .. " is at your base core!", "danger")
            end
            addBillboard(player, "DANGER", Color3.fromRGB(255, 0, 0), "Danger")
            addHighlight(char, "DangerHighlight", Color3.fromRGB(255, 0, 0))
        else
            removeBillboard(player, "Danger")
            removeHighlight(char, "DangerHighlight")
        end
    end
end)

-- ========== 🕵️ Detect Invisible Players ==========
RunService.Heartbeat:Connect(function()
    for _, player in ipairs(Players:GetPlayers()) do
        if player == LocalPlayer then continue end

        local char = player.Character
        if not char then continue end

        local hrp = char:FindFirstChild("HumanoidRootPart")
        if not hrp then continue end

        local isInvisible = false

        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" and part.Transparency == 1 then
                isInvisible = true
                break
            end
        end

        if isInvisible then
            for _, part in ipairs(char:GetDescendants()) do
                if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" and part.Transparency == 1 then
                    part.Transparency = 0.5
                end
            end
            addBillboard(player, "INVISIBLE", Color3.fromRGB(255, 0, 0), "Invisible")
            addHighlight(char, "InvisibleHighlight", Color3.fromRGB(255, 0, 0))
        else
            removeBillboard(player, "Invisible")
            removeHighlight(char, "InvisibleHighlight")
        end
    end
end)
